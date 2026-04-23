import React, { useState } from 'react';
import { Send, Check, FileText, Building2, User, Calculator, Briefcase, Scale, PiggyBank, FileCheck, Users, CreditCard } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const DemandeDevis = () => {
  const { t, language } = useLanguage();
  
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
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
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const structureLabel = formData.structureType === 'societe' ? t('devis.companyType') : t('devis.freelancerType');
    const volumeLabels: Record<string, string> = {
      '120': `≤ 120 ${t('devis.invoicesYear')}`,
      '250': `≤ 250 ${t('devis.invoicesYear')}`,
      '375': `≤ 375 ${t('devis.invoicesYear')}`,
      '500': `≤ 500 ${t('devis.invoicesYear')}`,
      'plus500': `> 500 ${t('devis.invoicesYear')} (${t('devis.customActivity')})`,
    };
    const urgencyLabels: Record<string, string> = {
      'urgent': t('devis.urgent'),
      'normal': t('devis.normal'),
      'flexible': t('devis.flexible'),
    };
    
    const subjectText = language === 'fr' ? 'Demande de devis personnalisé' : language === 'en' ? 'Personalized quote request' : 'Gepersonaliseerde offerteaanvraag';
    const subject = encodeURIComponent(`${subjectText} - ${structureLabel} - ${formData.companyName || formData.contactName}`);
    
    const notSpecified = language === 'fr' ? 'Non spécifié' : language === 'en' ? 'Not specified' : 'Niet gespecificeerd';
    const noMessage = language === 'fr' ? 'Aucun message' : language === 'en' ? 'No message' : 'Geen bericht';
    const noNeedsSelected = language === 'fr' ? 'Aucun besoin spécifique sélectionné' : language === 'en' ? 'No specific needs selected' : 'Geen specifieke behoeften geselecteerd';
    
    const body = encodeURIComponent(
      `=== ${subjectText.toUpperCase()} ===\n\n` +
      `--- ${t('devis.step4Title').toUpperCase()} ---\n` +
      `${t('devis.companyName')}: ${formData.companyName || notSpecified}\n` +
      `${t('devis.contactName')}: ${formData.contactName}\n` +
      `${t('common.email')}: ${formData.email}\n` +
      `${t('devis.phone')}: ${formData.phone || notSpecified}\n` +
      `${t('devis.preferredContact')}: ${formData.preferredContact === 'email' ? t('devis.byEmail') : t('devis.byPhone')}\n\n` +
      `--- ${t('devis.step1Title').toUpperCase()} ---\n` +
      `${structureLabel}\n\n` +
      `--- ${t('devis.step2Title').toUpperCase()} ---\n` +
      `${volumeLabels[formData.invoiceVolume] || notSpecified}\n\n` +
      `--- ${t('devis.step3Title').toUpperCase()} ---\n` +
      `${getSelectedNeeds() || noNeedsSelected}\n\n` +
      `--- ${t('devis.currentSituation').toUpperCase()} ---\n` +
      `${formData.currentSituation || notSpecified}\n\n` +
      `--- ${t('devis.urgency').toUpperCase()} ---\n` +
      `${urgencyLabels[formData.urgency]}\n\n` +
      `--- ${t('devis.additionalMessage').toUpperCase()} ---\n` +
      `${formData.message || noMessage}\n\n` +
      `---\n` +
      `${language === 'fr' ? 'Demande envoyée via le site FIDUTRUST' : language === 'en' ? 'Request sent via FIDUTRUST website' : 'Aanvraag verzonden via FIDUTRUST website'}`
    );
    
    window.location.href = `mailto:Info@fidutrust.eu?subject=${subject}&body=${body}`;
    
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setActiveStep(1);
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
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
      });
    }, 5000);
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

              <div className="mb-8">
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
                  disabled={!canSubmit}
                  className={`px-8 py-4 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                    canSubmit
                      ? 'bg-[#C6A664] text-white hover:bg-[#B89654] shadow-lg hover:shadow-xl'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" />
                  {t('devis.sendQuoteRequest')}
                </button>
              </div>

              {submitted && (
                <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-lg flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  {t('devis.emailOpened')}
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
