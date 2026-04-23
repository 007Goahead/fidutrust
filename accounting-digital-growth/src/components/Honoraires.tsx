import React from 'react';
import { Clock, Calculator, Scale, TrendingUp, Wifi, FileText, CreditCard } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Honoraires = () => {
  const { t } = useLanguage();

  const consultingFees = [
    {
      icon: <Calculator className="w-8 h-8" />,
      service: t('fees.accountingEntry'),
      rate: '70 €',
      description: t('fees.accountingEntryDesc')
    },
    {
      icon: <Clock className="w-8 h-8" />,
      service: t('fees.socialAdvice'),
      rate: '120 €',
      description: t('fees.socialAdviceDesc')
    },
    {
      icon: <Scale className="w-8 h-8" />,
      service: t('fees.legalAdvice'),
      rate: '150 €',
      description: t('fees.legalAdviceDesc')
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      service: t('fees.taxFinancialAdvice'),
      rate: '175 €',
      description: t('fees.taxFinancialAdviceDesc')
    }
  ];

  const digitalTools = [
    {
      icon: <Wifi className="w-6 h-6" />,
      tool: t('fees.peppolAccess'),
      price: t('fees.free'),
      description: t('fees.peppolDesc'),
      included: true
    },
    {
      icon: <FileText className="w-6 h-6" />,
      tool: t('fees.falcoSoftware'),
      price: t('fees.accordingVolume'),
      description: t('fees.falcoDesc'),
      included: false
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      tool: t('fees.codabox'),
      price: t('fees.accordingVolume'),
      description: t('fees.codaboxDesc'),
      included: false
    }
  ];

  return (
    <section id="honoraires" className="py-20 px-5 bg-[#0D1B2A]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-serif text-white text-center mb-4">
          {t('fees.title')}
        </h2>
        <p className="text-center text-gray-300 mb-16 max-w-2xl mx-auto">
          {t('fees.subtitle')}
        </p>

        {/* Consulting Fees */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-[#C6A664] text-center mb-8">
            {t('fees.consultingFees')}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {consultingFees.map((item, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="text-[#C6A664] mb-4 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h4 className="text-white font-semibold text-lg mb-2">{item.service}</h4>
                <p className="text-gray-400 text-sm mb-4">{item.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#C6A664]">{item.rate}</span>
                  <span className="text-gray-400 text-sm">{t('fees.perHour')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Tools */}
        <div>
          <h3 className="text-2xl font-semibold text-[#C6A664] text-center mb-8">
            {t('fees.digitalTools')}
          </h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {digitalTools.map((item, index) => (
              <div
                key={index}
                className={`rounded-2xl p-6 transition-all duration-300 ${
                  item.included
                    ? 'bg-[#C6A664]/20 border-2 border-[#C6A664]'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={item.included ? 'text-[#C6A664]' : 'text-gray-400'}>
                    {item.icon}
                  </div>
                  <h4 className="text-white font-semibold">{item.tool}</h4>
                </div>
                <p className="text-gray-400 text-sm mb-3">{item.description}</p>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  item.included
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-500/20 text-gray-300'
                }`}>
                  {item.price}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-300 mb-6">
            {t('fees.customQuoteNeeded')}
          </p>
          <button
            onClick={() => {
              const element = document.getElementById('devis');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-[#C6A664] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#B89654] transition-all shadow-lg hover:shadow-xl"
          >
            {t('fees.requestQuote')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Honoraires;
