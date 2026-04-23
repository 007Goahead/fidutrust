# Déploiement WordPress - FIDUTRUST

## Exporter le site React pour WordPress

### Option 1: Intégration via iframe (Simple)

1. **Déployer le site React** sur un hébergement statique (Netlify, Vercel, ou votre propre serveur)
2. **Dans WordPress**, créer une page et ajouter un bloc HTML personnalisé:

```html
<iframe 
  src="https://votre-site-react.com" 
  width="100%" 
  height="100vh" 
  frameborder="0"
  style="min-height: 100vh;"
></iframe>
```

### Option 2: Build statique intégré (Recommandé)

1. **Générer le build de production:**
```bash
npm run build
```

2. **Copier les fichiers** du dossier `dist/` vers votre thème WordPress ou un sous-dossier

3. **Créer un template WordPress** (`page-fidutrust.php`):
```php
<?php
/*
Template Name: FIDUTRUST App
*/
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FIDUTRUST - Beyond Numbers</title>
    <?php 
    // Inclure les CSS du build React
    $css_files = glob(get_template_directory() . '/fidutrust/assets/*.css');
    foreach($css_files as $css) {
        $css_url = get_template_directory_uri() . '/fidutrust/assets/' . basename($css);
        echo '<link rel="stylesheet" href="' . $css_url . '">';
    }
    ?>
</head>
<body>
    <div id="root"></div>
    <?php 
    // Inclure les JS du build React
    $js_files = glob(get_template_directory() . '/fidutrust/assets/*.js');
    foreach($js_files as $js) {
        $js_url = get_template_directory_uri() . '/fidutrust/assets/' . basename($js);
        echo '<script type="module" src="' . $js_url . '"></script>';
    }
    ?>
</body>
</html>
```

### Option 3: Plugin WordPress personnalisé

1. **Créer un plugin** `fidutrust-app/fidutrust-app.php`:

```php
<?php
/*
Plugin Name: FIDUTRUST App
Description: Application React FIDUTRUST intégrée
Version: 1.0
*/

function fidutrust_shortcode() {
    $plugin_url = plugin_dir_url(__FILE__);
    
    // Enqueue styles
    wp_enqueue_style('fidutrust-css', $plugin_url . 'dist/assets/index.css');
    
    // Enqueue scripts
    wp_enqueue_script('fidutrust-js', $plugin_url . 'dist/assets/index.js', array(), '1.0', true);
    
    return '<div id="root"></div>';
}
add_shortcode('fidutrust', 'fidutrust_shortcode');
```

2. **Copier le build** dans le dossier du plugin
3. **Utiliser le shortcode** `[fidutrust]` dans n'importe quelle page

## Support multilingue / Multilingual Support / Meertalige ondersteuning

Le site supporte 3 langues / The site supports 3 languages / De site ondersteunt 3 talen:
- **Français (FR)** - Langue par défaut / Default language / Standaardtaal
- **English (EN)**
- **Nederlands (NL)**

### Intégration avec WPML ou Polylang

Si vous utilisez WPML ou Polylang sur WordPress, vous pouvez synchroniser la langue:

```php
// Ajouter dans functions.php ou le plugin
function fidutrust_set_language() {
    $current_lang = 'fr'; // Par défaut
    
    // Pour WPML
    if (defined('ICL_LANGUAGE_CODE')) {
        $current_lang = ICL_LANGUAGE_CODE;
    }
    
    // Pour Polylang
    if (function_exists('pll_current_language')) {
        $current_lang = pll_current_language();
    }
    
    // Passer la langue à React via localStorage
    echo '<script>localStorage.setItem("fidutrust-language", "' . $current_lang . '");</script>';
}
add_action('wp_head', 'fidutrust_set_language');
```

### URLs multilingues

Pour des URLs séparées par langue:
- `/fr/` → Français
- `/en/` → English  
- `/nl/` → Nederlands

Le sélecteur de langue dans la navigation permet également de changer de langue dynamiquement.

## Configuration du formulaire de contact

Les formulaires envoient les emails à: **Info@fidutrust.eu**

Pour modifier l'adresse email, recherchez `Info@fidutrust.eu` dans les fichiers:
- `src/components/Contact.tsx`
- `src/components/DemandeDevis.tsx`
- `src/components/Footer.tsx`

## Structure des fichiers après build

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ... (autres assets)
└── ... (autres fichiers statiques)
```

## Checklist de déploiement

- [ ] Générer le build de production (`npm run build`)
- [ ] Vérifier que l'email est correct (Info@fidutrust.eu)
- [ ] Tester les 3 langues (FR, EN, NL)
- [ ] Copier les fichiers vers WordPress
- [ ] Configurer le template ou shortcode
- [ ] Tester le formulaire de contact
- [ ] Tester le formulaire de demande de devis
- [ ] Vérifier la navigation et les liens
- [ ] Tester sur mobile et desktop
- [ ] Configurer SSL/HTTPS si nécessaire

## Support

Pour toute question technique, contactez: **Info@fidutrust.eu**
