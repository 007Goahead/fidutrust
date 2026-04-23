import React, { useState } from 'react';
import { Check, Calendar, CreditCard } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
const FormulesIndependants = () => {
  const {
    t
  } = useLanguage();
  const [selectedFormula, setSelectedFormula] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'annual' | 'monthly'>('monthly');
  const formulas = [{
    name: t('formulas.essential'),
    monthlyPrice: 95,
    annualPrice: 948,
    invoices: '120',
    ideal: t('formulas.beginnerFreelancer'),
    features: [t('formulas.accountingEntry'), t('formulas.vatDeclarations'), t('formulas.ippDeclaration'), t('formulas.deadlineTracking')]
  }, {
    name: t('formulas.standard'),
    monthlyPrice: 191,
    annualPrice: 1908,
    invoices: '250',
    ideal: t('formulas.growingActivity'),
    popular: true,
    features: [t('formulas.allEssentialPlus'), t('formulas.basicTaxAdvice'), t('formulas.contributionOptimization')]
  }, {
    name: t('formulas.advanced'),
    monthlyPrice: 299,
    annualPrice: 2988,
    invoices: '375',
    ideal: t('formulas.establishedFreelancer'),
    features: [t('formulas.allStandardPlus'), t('formulas.taxOptimization'), t('formulas.cashManagement'), t('formulas.financialPlanning')]
  }, {
    name: t('formulas.premium'),
    monthlyPrice: 395,
    annualPrice: 3948,
    invoices: '500',
    ideal: t('formulas.liberalProfession'),
    features: [t('formulas.allAdvancedPlus'), t('formulas.strategicAdvice'), t('formulas.bankAssistance'), t('formulas.absolutePriority')]
  }];
  const handleSelectFormula = (name: string) => {
    setSelectedFormula(name);
    const element = document.getElementById('devis');
    element?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  const getDisplayPrice = (formula: typeof formulas[0]) => {
    if (billingPeriod === 'annual') {
      return `${formula.annualPrice.toLocaleString('fr-BE')} €`;
    }
    return `${formula.monthlyPrice} €`;
  };
  const getPriceLabel = () => {
    return billingPeriod === 'annual' ? t('formulas.perYear') : t('formulas.perMonth');
  };
  const annualBenefits = [{
    icon: <Check className="w-5 h-5" />,
    text: t('formulas.save20')
  }, {
    icon: <Calendar className="w-5 h-5" />,
    text: t('formulas.securedBudget')
  }, {
    icon: <CreditCard className="w-5 h-5" />,
    text: t('formulas.priorityProcessing')
  }];
  return <section id="formules-independants" className="py-20 px-5 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-serif text-[#0D1B2A] text-center mb-4">
          {t('formulas.freelancersTitle')}
        </h2>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          {t('formulas.subtitle')}
        </p>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 p-1 rounded-full inline-flex items-center">
            <button onClick={() => setBillingPeriod('annual')} className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${billingPeriod === 'annual' ? 'bg-[#0D1B2A] text-white shadow-lg' : 'text-gray-600 hover:text-gray-900'}`}>
              {t('formulas.annual')}
              <span className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                -20%
              </span>
            </button>
            <button onClick={() => setBillingPeriod('monthly')} className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${billingPeriod === 'monthly' ? 'bg-[#0D1B2A] text-white shadow-lg' : 'text-gray-600 hover:text-gray-900'}`}>
              {t('formulas.monthly')}
            </button>
          </div>
        </div>

        {/* Annual Benefits Banner */}
        {billingPeriod === 'annual' && <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-10 max-w-3xl mx-auto">
            <div className="flex flex-wrap justify-center gap-6">
              {annualBenefits.map((benefit, index) => <div key={index} className="flex items-center gap-2 text-green-700">
                  {benefit.icon}
                  <span className="text-sm font-medium">{benefit.text}</span>
                </div>)}
            </div>
          </div>}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {formulas.map((formula, index) => <div key={index} className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${formula.popular ? 'ring-2 ring-[#C6A664] scale-105' : ''}`}>
              {formula.popular && <div className="absolute top-0 left-0 right-0 bg-[#C6A664] text-white text-center py-1 text-sm font-medium">
                  {t('formulas.mostPopular')}
                </div>}
              <div className={`p-6 ${formula.popular ? 'pt-10' : ''}`}>
                <h3 className="text-xl font-bold text-[#0D1B2A] mb-2">{formula.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{formula.ideal}</p>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold text-[#0D1B2A]">
                    {getDisplayPrice(formula)}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">{getPriceLabel()}</span>
                  
                  {billingPeriod === 'annual' && <p className="text-xs text-gray-500 mt-1" data-mixed-content="true" data-mixed-content="true" data-mixed-content="true" data-mixed-content="true" data-mixed-content="true">
                      soit {Math.round(formula.annualPrice / 12)} €/mois
                    </p>}
                  
                  {billingPeriod === 'monthly' && <p className="text-xs text-gray-500 mt-1" data-mixed-content="true" data-mixed-content="true" data-mixed-content="true" data-mixed-content="true" data-mixed-content="true">
                      ou {formula.annualPrice.toLocaleString('fr-BE')} €/an (économie 20% soit {Math.round(formula.annualPrice / 12)} €/mois)
                    </p>}
                </div>


                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-[#0D1B2A]" data-mixed-content="true" data-mixed-content="true" data-mixed-content="true" data-mixed-content="true" data-mixed-content="true">≤ {formula.invoices}</span> {t('formulas.invoicesYear')}
                  </p>
                </div>

                <ul className="space-y-2 mb-6">
                  {formula.features.map((feature, idx) => <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>)}
                </ul>

                <button onClick={() => handleSelectFormula(formula.name)} className={`w-full py-3 rounded-lg font-medium transition-all ${formula.popular ? 'bg-[#C6A664] text-white hover:bg-[#B89654]' : 'bg-[#0D1B2A] text-white hover:bg-[#1a2d42]'}`}>
                  {t('formulas.choose')} {formula.name}
                </button>
              </div>
            </div>)}
        </div>

        {/* Additional Info */}
        <div className="text-center space-y-4">
          <p className="text-gray-600" data-mixed-content="true">
            {t('formulas.customQuote')} | {t('formulas.registrationIncluded')}
          </p>
          <p className="text-sm text-gray-500">{t('formulas.allPricesExclVAT')} - {t('formulas.digitalToolsDisclaimer')}</p>
        </div>

      </div>
    </section>;
};
export default FormulesIndependants;