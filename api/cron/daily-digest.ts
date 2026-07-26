import type { VercelRequest, VercelResponse } from '@vercel/node';

// "Agent dispatcher" - reads ClickUp only, writes a single daily comment on a
// fixed internal task. Never touches prospects/clients, never sends external
// email, never spends money. Triggered by Vercel Cron (see vercel.json).

const CLICKUP_TOKEN = process.env.CLICKUP_API_TOKEN;
const TEAM_ID = '90121901384';
const PROSPECTS_LIST_ID = '901219609612';
const DIGEST_TASK_ID = '869e9du76'; // "Digest quotidien" in 05 > Automatisations et outils

// Pascal's other workspaces (see memory/pn_activity_workspaces.md) - each is
// fully separate from Fidutrust (isolation for partners, clean divestiture),
// but he still wants one cross-portfolio "what needs attention" view for
// himself. ClickUp has no native cross-workspace view, so this cron builds one.
const PORTFOLIO_TEAMS: { id: string; label: string }[] = [
  { id: '90121901384', label: 'Fidutrust' },
  { id: '90121923672', label: 'Groupe Horeca' },
  { id: '90121923688', label: 'Construction & EcoConcepts' },
  { id: '90121923690', label: 'Dordogne' },
  { id: '90121923695', label: 'Capital & Investissement' },
  { id: '90121923699', label: 'FeelHarmonics' },
];
const PORTFOLIO_DIGEST_TASK_ID = '869e9fdb5'; // "Alertes multi-portefeuille" in Pascal's private space

const STALE_PROSPECT_DAYS = 5;
const DUE_SOON_HOURS = 48;

type ClickUpTask = {
  id: string;
  name: string;
  due_date: string | null;
  date_updated: string;
  status: { status: string; type: string };
  assignees: { id: number; username: string }[];
  list: { id: string; name: string };
};

async function fetchAllTasks(teamId: string): Promise<ClickUpTask[]> {
  const tasks: ClickUpTask[] = [];
  for (let page = 0; page < 5; page++) {
    const resp = await fetch(
      `https://api.clickup.com/api/v2/team/${teamId}/task?include_closed=false&subtasks=true&page=${page}`,
      { headers: { Authorization: CLICKUP_TOKEN as string } }
    );
    if (!resp.ok) break;
    const data = await resp.json();
    const batch: ClickUpTask[] = data.tasks || [];
    tasks.push(...batch);
    if (data.last_page !== false) break;
  }
  return tasks;
}

function fmtDate(ms: number): string {
  return new Date(ms).toLocaleDateString('fr-BE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function assigneeNames(t: ClickUpTask): string {
  return t.assignees.length ? t.assignees.map((a) => a.username).join(', ') : 'Non assigné';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (!CLICKUP_TOKEN) {
    res.status(500).json({ error: 'CLICKUP_API_TOKEN not configured' });
    return;
  }

  try {
    const now = Date.now();
    const tasks = await fetchAllTasks(TEAM_ID);

    const overdue = tasks.filter((t) => t.due_date && Number(t.due_date) < now && t.list.id !== PROSPECTS_LIST_ID);
    const dueSoon = tasks.filter(
      (t) =>
        t.due_date &&
        Number(t.due_date) >= now &&
        Number(t.due_date) <= now + DUE_SOON_HOURS * 3600 * 1000 &&
        t.list.id !== PROSPECTS_LIST_ID
    );
    const staleProspects = tasks.filter(
      (t) => t.list.id === PROSPECTS_LIST_ID && now - Number(t.date_updated) > STALE_PROSPECT_DAYS * 24 * 3600 * 1000
    );

    const lines: string[] = [`📋 Digest du ${fmtDate(now)}`, ''];

    lines.push(`⏰ En retard (${overdue.length})`);
    if (overdue.length === 0) lines.push('- Rien en retard.');
    for (const t of overdue) {
      lines.push(`- ${t.name} — assigné: ${assigneeNames(t)} — échéance ${fmtDate(Number(t.due_date))}`);
    }
    lines.push('', `🔜 Échéance ≤ 48h (${dueSoon.length})`);
    if (dueSoon.length === 0) lines.push('- Rien dans les 48h.');
    for (const t of dueSoon) {
      lines.push(`- ${t.name} — assigné: ${assigneeNames(t)} — échéance ${fmtDate(Number(t.due_date))}`);
    }
    lines.push('', `🥶 Prospects sans activité depuis ${STALE_PROSPECT_DAYS}+ jours (${staleProspects.length})`);
    if (staleProspects.length === 0) lines.push('- Aucun.');
    for (const t of staleProspects) {
      lines.push(`- ${t.name} — dernière activité: ${fmtDate(Number(t.date_updated))}`);
    }
    lines.push('', '_Résumé interne automatique - rien n\'est envoyé à l\'extérieur ni modifié._');

    const commentResp = await fetch(`https://api.clickup.com/api/v2/task/${DIGEST_TASK_ID}/comment`, {
      method: 'POST',
      headers: { Authorization: CLICKUP_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment_text: lines.join('\n'), notify_all: false }),
    });

    // Cross-portfolio sweep - Pascal-only, aggregates every workspace since
    // ClickUp itself has no cross-workspace view. Overdue/due-soon only (no
    // stale-prospect logic outside Fidutrust - the other workspaces don't have
    // that concept yet).
    const portfolioLines: string[] = [`📊 Vue d'ensemble du ${fmtDate(now)}`, ''];
    let portfolioOverdueTotal = 0;
    let portfolioDueSoonTotal = 0;
    for (const team of PORTFOLIO_TEAMS) {
      const teamTasks = team.id === TEAM_ID ? tasks : await fetchAllTasks(team.id);
      const teamOverdue = teamTasks.filter((t) => t.due_date && Number(t.due_date) < now);
      const teamDueSoon = teamTasks.filter(
        (t) => t.due_date && Number(t.due_date) >= now && Number(t.due_date) <= now + DUE_SOON_HOURS * 3600 * 1000
      );
      portfolioOverdueTotal += teamOverdue.length;
      portfolioDueSoonTotal += teamDueSoon.length;
      if (teamOverdue.length === 0 && teamDueSoon.length === 0) continue;
      portfolioLines.push(`**${team.label}**`);
      for (const t of teamOverdue) {
        portfolioLines.push(`- ⏰ ${t.name} (${t.list.name}) — en retard depuis le ${fmtDate(Number(t.due_date))}`);
      }
      for (const t of teamDueSoon) {
        portfolioLines.push(`- 🔜 ${t.name} (${t.list.name}) — échéance ${fmtDate(Number(t.due_date))}`);
      }
      portfolioLines.push('');
    }
    if (portfolioOverdueTotal === 0 && portfolioDueSoonTotal === 0) {
      portfolioLines.push('Rien en retard ni à échéance proche dans aucun portefeuille.');
    }
    portfolioLines.push('', '_Résumé interne automatique - rien n\'est envoyé à l\'extérieur ni modifié._');

    const portfolioCommentResp = await fetch(`https://api.clickup.com/api/v2/task/${PORTFOLIO_DIGEST_TASK_ID}/comment`, {
      method: 'POST',
      headers: { Authorization: CLICKUP_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment_text: portfolioLines.join('\n'), notify_all: false }),
    });

    res.status(200).json({
      ok: true,
      posted: commentResp.ok,
      counts: { overdue: overdue.length, dueSoon: dueSoon.length, staleProspects: staleProspects.length },
      portfolio: {
        posted: portfolioCommentResp.ok,
        overdue: portfolioOverdueTotal,
        dueSoon: portfolioDueSoonTotal,
      },
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
