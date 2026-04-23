import React from 'react';
import { Target, Eye, Lightbulb, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Presentation = () => {
  const { t } = useLanguage();

  return (
    <section id="presentation" className="py-20 px-5 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Vision Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#C6A664]/10 text-[#C6A664] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Eye className="w-4 h-4" />
            {t('presentation.ourVision')}
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-[#0D1B2A] mb-6">
            {t('presentation.title')}
          </h2>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto">
            <strong className="text-[#0D1B2A]">FIDUTRUST</strong> {t('presentation.description')} <strong className="text-[#C6A664]">{t('presentation.strategicTool')}</strong>{t('presentation.allowing')} <em>{t('presentation.understand')}</em>{t('presentation.compliance')}
          </p>
        </div>

        {/* Key Pillars */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gradient-to-br from-[#0D1B2A] to-[#1a2d47] rounded-2xl p-8 text-white">
            <div className="bg-[#C6A664]/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Target className="w-7 h-7 text-[#C6A664]" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{t('presentation.pillar1Title')}</h3>
            <p className="text-gray-300">
              {t('presentation.pillar1Desc')}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-[#C6A664] to-[#B89654] rounded-2xl p-8 text-white">
            <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Lightbulb className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{t('presentation.pillar2Title')}</h3>
            <p className="text-white/90">
              {t('presentation.pillar2Desc')}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-[#0D1B2A] to-[#1a2d47] rounded-2xl p-8 text-white">
            <div className="bg-[#C6A664]/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <TrendingUp className="w-7 h-7 text-[#C6A664]" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{t('presentation.pillar3Title')}</h3>
            <p className="text-gray-300">
              {t('presentation.pillar3Desc')}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#C6A664] mb-2">40+</div>
              <div className="text-sm text-gray-600">{t('presentation.yearsExpertise')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#C6A664] mb-2">500+</div>
              <div className="text-sm text-gray-600">{t('presentation.clientsSupported')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#C6A664] mb-2">100%</div>
              <div className="text-sm text-gray-600">{t('presentation.digitalCompliant')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#C6A664] mb-2">24h</div>
              <div className="text-sm text-gray-600">{t('presentation.responseDelay')}</div>
            </div>
          </div>
        </div>

        {/* Tools mention */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">{t('presentation.digitalTools')}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-[#0D1B2A] shadow-sm">
              FALCO
            </span>
            <span className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-[#0D1B2A] shadow-sm">
              HORUS
            </span>
            <span className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-[#0D1B2A] shadow-sm">
              PEPPOL 2026
            </span>
            <span className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-[#0D1B2A] shadow-sm">
              CODABOX
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Presentation;
