import React, { useState } from 'react';
import { Send, Check, FileText, Building2, User, Calculator, Briefcase, Scale, PiggyBank, FileCheck, Users, CreditCard, Upload, AlertCircle, Loader2, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

const DemandeDevis = () => {
  const { t, language } = useLanguage();

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    vatNumber: '',
    structureType: '',
    invoiceVolume: '',
    needs: {
      comptabilite: false,
      tva: false,
      comptesAnnuels: false,
      isoc: false,
      ipp: false,
      ubo: false,
      peppol: false,
      conseilFiscal: false,
      conseilSocial: false,
      conseilJuridique: false,
      planFinancier: false,
      tresorerie: false,
    },
    currentSituation: '',
    message: '',
    preferredContact: 'email',
    urgency: 'normal',
    leadSource: '',
    iban: '',
    bankName: '',
    contactLanguage: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitStage, setSubmitStage] = useState<'idle' | 'uploading' | 'sending'>('idle');

  const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB per file
  const MAX_FILES = 5;

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList) return;
    const incoming = Array.from(fileList);
    const oversized = incoming.find((f) => f.size > MAX_FILE_SIZE);
    if (oversized) {
      setSubmitError(`"${oversized.name}" dépasse 15 Mo — merci de réduire sa taille ou de l'envoyer séparément par email.`);
      return;
    }
    setSubmitError(null);
    setDocumentFiles((prev) => [...prev, ...incoming].slice(0, MAX_FILES));
  };

  const removeDocumentFile = (index: number) => {
    setDocumentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNeedChange = (need: keyof typeof formData.needs) => {
    setFormData(prev => ({
      ...prev,
      needs: {
        ...prev.needs,
        [need]: !prev.needs[need]
      }
    }));
  };

  const handleStructureSelect = (type: string) => {
    setFormData(prev => ({ ...prev, structureType: type }));
  };

  const handleVolumeSelect = (volume: string) => {
    setFormData(prev => ({ ...prev, invoiceVolume: volume }));
  };

  const getSelectedNeeds = () => {
    const needLabels: Record<string, string> = {
      comptabilite: t('devis.accountingEntry'),
      tva: t('devis.vatDeclarations'),
      comptesAnnuels: t('devis.annualAccounts'),
      isoc: t('devis.isocDeclaration'),
      ipp: t('devis.ippDeclaration'),
      ubo: t('devis.uboRegister'),
      peppol: t('devis.peppolInvoicing'),
      conseilFiscal: t('devis.taxAdvice'),
      conseilSocial: t('devis.socialAdvice'),
      conseilJuridique: t('devis.legalAdvice'),
      planFinancier: t('devis.financialPlan'),
      tresorerie: t('devis.cashManagement'),
    };
    
    return Object.entries(formData.needs)
      .filter(([_, selected]) => selected)
      .map(([key]) => needLabels[key])
      .join(', ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const documentPaths: string[] = [];

      if (documentFiles.length > 0) {
        setSubmitStage('uploading');
        for (const file of documentFiles) {
          const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
          const path = `${crypto.randomUUID()}-${safeName}`;
          const { error: uploadError } = await supabase.storage.from('lead-documents').upload(path, file);
          if (uploadError) {
            console.error('Upload failed for', file.name, uploadError);
            throw new Error(`Échec de l'envoi de "${file.name}" : ${uploadError.message}`);
          }
          documentPaths.push(path);
        }
      }

      setSubmitStage('sending');
      const needsSelected = Object.entries(formData.needs)
        .filter(([, selected]) => selected)
        .map(([key]) => key);

      const response = await fetch('/api/create-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceForm: 'devis',
          companyName: formData.companyName,
          contactName: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          vatNumber: formData.vatNumber,
          structureType: formData.structureType,
          invoiceVolume: formData.invoiceVolume,
          needs: needsSelected,
          currentSituation: formData.currentSituation,
          message: formData.message,
          preferredContact: formData.preferredContact,
          urgency: formData.urgency,
          leadSource: formData.leadSource,
          iban: formData.iban,
          bankName: formData.bankName,
          contactLanguage: formData.contactLanguage,
          language,
          documentPaths,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      setSubmitted(true);
      setActiveStep(1);
      setDocumentFiles([]);
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        vatNumber: '',
        structureType: '',
        invoiceVolume: '',
        needs: {
          comptabilite: false,
          tva: false,
          comptesAnnuels: false,
          isoc: false,
          ipp: false,
          ubo: false,
          peppol: false,
          conseilFiscal: false,
          conseilSocial: false,
          conseilJuridique: false,
          planFinancier: false,
          tresorerie: false,
        },
        currentSituation: '',
        message: '',
        preferredContact: 'email',
        urgency: 'normal',
        leadSource: '',
        iban: '',
        bankName: '',
        contactLanguage: '',
      });
      setTimeout(() => setSubmitted(false), 8000);
    } catch (err) {
      console.error('Quote request submission failed', err);
      const detail = err instanceof Error && err.message.startsWith("Échec de l'envoi") ? err.message : t('devis.submitError');
      setSubmitError(detail);
    } finally {
      setIsSubmitting(false);
      setSubmitStage('idle');
    }
  };

  const canProceedStep1 = formData.structureType !== '';
  const canProceedStep2 = formData.invoiceVolume !== '';
  const canProceedStep3 = Object.values(formData.needs).some(v => v);
  const canSubmit = formData.contactName && formData.email && canProceedStep1 && canProceedStep2;

  const needsOptions = [
    { key: 'comptabilite', label: t('devis.accountingEntry'), icon: Calculator, description: t('devis.accountingEntryDesc') },
    { key: 'tva', label: t('devis.vatDeclarations'), icon: FileText, description: t('devis.vatDeclarationsDesc') },
    { key: 'comptesAnnuels', label: t('devis.annualAccounts'), icon: FileCheck, description: t('devis.annualAccountsDesc') },
    { key: 'isoc', label: t('devis.isocDeclaration'), icon: Building2, description: t('devis.isocDeclarationDesc') },
    { key: 'ipp', label: t('devis.ippDeclaration'), icon: User, description: t('devis.ippDeclarationDesc') },
    { key: 'ubo', label: t('devis.uboRegister'), icon: Users, description: t('devis.uboRegisterDesc') },
    { key: 'peppol', label: t('devis.peppolInvoicing'), icon: CreditCard, description: t('devis.peppolInvoicingDesc') },
    { key: 'conseilFiscal', label: t('devis.taxAdvice'), icon: PiggyBank, description: t('devis.taxAdviceDesc') },
    { key: 'conseilSocial', label: t('devis.socialAdvice'), icon: Users, description: t('devis.socialAdviceDesc') },
    { key: 'conseilJuridique', label: t('devis.legalAdvice'), icon: Scale, description: t('devis.legalAdviceDesc') },
    { key: 'planFinancier', label: t('devis.financialPlan'), icon: Briefcase, description: t('devis.financialPlanDesc') },
    { key: 'tresorerie', label: t('devis.cashManagement'), icon: Calculator, description: t('devis.cashManagementDesc') },
  ];

  return (
    <section id="devis" className="py-20 px-5 bg-gradient-to-br from-[#0D1B2A] via-[#1B2D3E] to-[#0D1B2A]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-[#C6A664]/20 text-[#C6A664] rounded-full text-sm font-medium mb-4">
            {t('devis.badge')}
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
            {t('devis.title')}
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {t('devis.subtitle')}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2 md:gap-4">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <button
                  onClick={() => setActiveStep(step)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    activeStep === step
                      ? 'bg-[#C6A664] text-white scale-110'
                      : activeStep > step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {activeStep > step ? <Check className="w-5 h-5" /> : step}
                </button>
                {step < 4 && (
                  <div className={`w-8 md:w-16 h-1 rounded ${activeStep > step ? 'bg-green-500' : 'bg-gray-600'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Step 1: Structure Type */}
          {activeStep === 1 && (
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-semibold text-[#0D1B2A] mb-2">{t('devis.step1Title')}</h3>
              <p className="text-gray-600 mb-8">{t('devis.step1Subtitle')}</p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <button
                  type="button"
                  onClick={() => handleStructureSelect('societe')}
                  className={`p-8 rounded-2xl border-2 transition-all text-left ${
                    formData.structureType === 'societe'
                      ? 'border-[#C6A664] bg-[#C6A664]/10 shadow-lg'
                      : 'border-gray-200 hover:border-[#C6A664]/50 hover:bg-gray-50'
                  }`}
                >
                  <Building2 className={`w-12 h-12 mb-4 ${formData.structureType === 'societe' ? 'text-[#C6A664]' : 'text-gray-400'}`} />
                  <h4 className="text-xl font-semibold text-[#0D1B2A] mb-2">{t('devis.companyType')}</h4>
                  <p className="text-gray-600 text-sm">
                    {t('devis.companyDesc')}
                  </p>
                  <div className="mt-4 text-sm text-[#C6A664] font-medium">
                    {t('devis.fromPrice')} 99 €/{language === 'fr' ? 'mois' : language === 'en' ? 'month' : 'maand'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleStructureSelect('independant')}
                  className={`p-8 rounded-2xl border-2 transition-all text-left ${
                    formData.structureType === 'independant'
                      ? 'border-[#C6A664] bg-[#C6A664]/10 shadow-lg'
                      : 'border-gray-200 hover:border-[#C6A664]/50 hover:bg-gray-50'
                  }`}
                >
                  <User className={`w-12 h-12 mb-4 ${formData.structureType === 'independant' ? 'text-[#C6A664]' : 'text-gray-400'}`} />
                  <h4 className="text-xl font-semibold text-[#0D1B2A] mb-2">{t('devis.freelancerType')}</h4>
                  <p className="text-gray-600 text-sm">
                    {t('devis.freelancerDesc')}
                  </p>
                  <div className="mt-4 text-sm text-[#C6A664] font-medium">
                    {t('devis.fromPrice')} 79 €/{language === 'fr' ? 'mois' : language === 'en' ? 'month' : 'maand'}
                  </div>
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  disabled={!canProceedStep1}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                    canProceedStep1
                      ? 'bg-[#C6A664] text-white hover:bg-[#B89654]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {t('devis.continue')}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Invoice Volume */}
          {activeStep === 2 && (
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-semibold text-[#0D1B2A] mb-2">{t('devis.step2Title')}</h3>
              <p className="text-gray-600 mb-8">{t('devis.step2Subtitle')}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {[
                  { value: '120', label: '≤ 120', sublabel: t('devis.invoicesYear'), desc: t('devis.lightActivity') },
                  { value: '250', label: '≤ 250', sublabel: t('devis.invoicesYear'), desc: t('devis.moderateActivity') },
                  { value: '375', label: '≤ 375', sublabel: t('devis.invoicesYear'), desc: t('devis.sustainedActivity') },
                  { value: '500', label: '≤ 500', sublabel: t('devis.invoicesYear'), desc: t('devis.intenseActivity') },
                  { value: 'plus500', label: '> 500', sublabel: t('devis.invoicesYear'), desc: t('devis.customActivity') },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleVolumeSelect(option.value)}
                    className={`p-6 rounded-xl border-2 transition-all text-center ${
                      formData.invoiceVolume === option.value
                        ? 'border-[#C6A664] bg-[#C6A664]/10 shadow-lg'
                        : 'border-gray-200 hover:border-[#C6A664]/50 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`text-2xl font-bold mb-1 ${formData.invoiceVolume === option.value ? 'text-[#C6A664]' : 'text-[#0D1B2A]'}`}>
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-500">{option.sublabel}</div>
                    <div className="text-xs text-gray-400 mt-2">{option.desc}</div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-8 py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-all"
                >
                  {t('devis.back')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  disabled={!canProceedStep2}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                    canProceedStep2
                      ? 'bg-[#C6A664] text-white hover:bg-[#B89654]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {t('devis.continue')}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Specific Needs */}
          {activeStep === 3 && (
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-semibold text-[#0D1B2A] mb-2">{t('devis.step3Title')}</h3>
              <p className="text-gray-600 mb-8">{t('devis.step3Subtitle')}</p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {needsOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = formData.needs[option.key as keyof typeof formData.needs];
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => handleNeedChange(option.key as keyof typeof formData.needs)}
                      className={`p-4 rounded-xl border-2 transition-all text-left flex items-start gap-3 ${
                        isSelected
                          ? 'border-[#C6A664] bg-[#C6A664]/10'
                          : 'border-gray-200 hover:border-[#C6A664]/50 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#C6A664] text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className={`font-semibold text-sm ${isSelected ? 'text-[#C6A664]' : 'text-[#0D1B2A]'}`}>
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-8 py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-all"
                >
                  {t('devis.back')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  className="px-8 py-3 rounded-lg font-semibold bg-[#C6A664] text-white hover:bg-[#B89654] transition-all"
                >
                  {t('devis.continue')}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Contact Information */}
          {activeStep === 4 && (
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-semibold text-[#0D1B2A] mb-2">{t('devis.step4Title')}</h3>
              <p className="text-gray-600 mb-8">{t('devis.step4Subtitle')}</p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-[#0D1B2A] mb-2">
                    {t('devis.companyName')}
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="FIDUTRUST SRL"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#C6A664] focus:ring-2 focus:ring-[#C6A664]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0D1B2A] mb-2">
                    {t('devis.contactName')} *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    required
                    placeholder="Jean Dupont"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#C6A664] focus:ring-2 focus:ring-[#C6A664]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-[#0D1B2A] mb-2">
                    {t('common.email')} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="jean@exemple.be"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#C6A664] focus:ring-2 focus:ring-[#C6A664]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0D1B2A] mb-2">
                    {t('devis.phone')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+32 XXX XX XX XX"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#C6A664] focus:ring-2 focus:ring-[#C6A664]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-[#0D1B2A] mb-2">
                    {t('devis.vatNumber')}
                  </label>
                  <input
                    type="text"
                    name="vatNumber"
                    value={formData.vatNumber}
                    onChange={handleInputChange}
                    placeholder="BE 0123.456.789"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#C6A664] focus:ring-2 focus:ring-[#C6A664]/20 outline-none transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-1">{t('devis.vatNumberHint')}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0D1B2A] mb-2">
                    {t('devis.leadSource')}
                  </label>
                  <select
                    name="leadSource"
                    value={formData.leadSource}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#C6A664] focus:ring-2 focus:ring-[#C6A664]/20 outline-none transition-all"
                  >
                    <option value="">{t('devis.selectLeadSource')}</option>
                    <option value="bouche-a-oreille">{t('devis.sourceWordOfMouth')}</option>
                    <option value="google">{t('devis.sourceGoogle')}</option>
                    <option value="recommandation">{t('devis.sourceRecommendation')}</option>
                    <option value="site-web">{t('devis.sourceWebsite')}</option>
                    <option value="autre">{t('devis.sourceOther')}</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-[#0D1B2A] mb-2">
                    {t('devis.preferredContact')}
                  </label>
                  <select
                    name="preferredContact"
                    value={formData.preferredContact}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#C6A664] focus:ring-2 focus:ring-[#C6A664]/20 outline-none transition-all"
                  >
                    <option value="email">{t('devis.byEmail')}</option>
                    <option value="phone">{t('devis.byPhone')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0D1B2A] mb-2">
                    {t('devis.contactLanguage')}
                  </label>
                  <select
                    name="contactLanguage"
                    value={formData.contactLanguage}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#C6A664] focus:ring-2 focus:ring-[#C6A664]/20 outline-none transition-all"
                  >
                    <option value="">{t('devis.selectContactLanguage')}</option>
                    <option value="fr">{t('devis.langFrench')}</option>
                    <option value="nl">{t('devis.langDutch')}</option>
                    <option value="en">{t('devis.langEnglish')}</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-[#0D1B2A] mb-2">
                    {t('devis.urgency')}
                  </label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#C6A664] focus:ring-2 focus:ring-[#C6A664]/20 outline-none transition-all"
                  >
                    <option value="urgent">{t('devis.urgent')}</option>
                    <option value="normal">{t('devis.normal')}</option>
                    <option value="flexible">{t('devis.flexible')}</option>
                  </select>
                </div>
                <div />
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-[#0D1B2A] mb-2">
                    {t('devis.iban')}
                  </label>
                  <input
                    type="text"
                    name="iban"
                    value={formData.iban}
                    onChange={handleInputChange}
                    placeholder="BE68 5390 0754 7034"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#C6A664] focus:ring-2 focus:ring-[#C6A664]/20 outline-none transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-1">{t('devis.ibanHint')}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0D1B2A] mb-2">
                    {t('devis.bankName')}
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    placeholder={t('devis.bankNamePlaceholder')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#C6A664] focus:ring-2 focus:ring-[#C6A664]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#0D1B2A] mb-2">
                  {t('devis.currentSituation')}
                </label>
                <select
                  name="currentSituation"
                  value={formData.currentSituation}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#C6A664] focus:ring-2 focus:ring-[#C6A664]/20 outline-none transition-all"
                >
                  <option value="">{t('devis.selectSituation')}</option>
                  <option value="creation">{t('devis.creation')}</option>
                  <option value="changement">{t('devis.change')}</option>
                  <option value="reprise">{t('devis.recovery')}</option>
                  <option value="optimisation">{t('devis.optimization')}</option>
                  <option value="autre">{t('devis.other')}</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#0D1B2A] mb-2">
                  {t('devis.additionalMessage')}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder={t('devis.additionalMessagePlaceholder')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#C6A664] focus:ring-2 focus:ring-[#C6A664]/20 outline-none transition-all resize-none"
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-[#0D1B2A] mb-2">
                  {t('devis.uploadStatuts')}
                </label>

                {documentFiles.length > 0 && (
                  <ul className="mb-3 space-y-2">
                    {documentFiles.map((file, index) => (
                      <li
                        key={`${file.name}-${index}`}
                        className="flex items-center gap-3 p-2 pl-3 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{(file.size / 1024 / 1024).toFixed(1)} Mo</span>
                        <button
                          type="button"
                          onClick={() => removeDocumentFile(index)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {documentFiles.length < MAX_FILES && (
                  <label className="flex items-center gap-3 w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#C6A664]/50 hover:bg-gray-50 transition-all">
                    <Upload className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600 truncate">{t('devis.uploadStatutsHint')}</span>
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/png,.doc,.docx"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        handleFilesSelected(e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h4 className="font-semibold text-[#0D1B2A] mb-4">{t('devis.summary')}</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">{t('devis.structure')} :</span>
                    <span className="ml-2 font-medium text-[#0D1B2A]">
                      {formData.structureType === 'societe' ? t('devis.companyType') : t('devis.freelancerType')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('devis.volume')} :</span>
                    <span className="ml-2 font-medium text-[#0D1B2A]">
                      {formData.invoiceVolume === 'plus500' ? '> 500' : `≤ ${formData.invoiceVolume}`} {t('devis.invoicesYear')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('devis.services')} :</span>
                    <span className="ml-2 font-medium text-[#0D1B2A]">
                      {Object.values(formData.needs).filter(v => v).length} {t('devis.selected')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="px-8 py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-all"
                >
                  {t('devis.back')}
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className={`px-8 py-4 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                    canSubmit && !isSubmitting
                      ? 'bg-[#C6A664] text-white hover:bg-[#B89654] shadow-lg hover:shadow-xl'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {submitStage === 'uploading' ? t('devis.uploading') : t('devis.sending')}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {t('devis.sendQuoteRequest')}
                    </>
                  )}
                </button>
              </div>

              {submitted && (
                <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-lg flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  {t('devis.emailOpened')}
                </div>
              )}

              {submitError && (
                <div className="mt-6 p-4 bg-red-100 text-red-800 rounded-lg flex items-center justify-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {submitError}
                </div>
              )}

              <p className="text-xs text-gray-500 text-center mt-6">
                {t('devis.privacyNotice')}
              </p>
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

export default DemandeDevis;
