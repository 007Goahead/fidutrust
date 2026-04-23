import React from 'react';
import { ArrowRight, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Hero = () => {
  const { t } = useLanguage();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative bg-[#0D1B2A] text-white py-32 px-5 text-center overflow-hidden min-h-[90vh] flex items-center">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A] via-[#1a2d47] to-[#0D1B2A]"></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#C6A664] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C6A664] rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-8">
          <span className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></span>
          {t('hero.badge')}
        </div>
        
        <h1 className="text-5xl md:text-7xl mb-3 font-serif font-bold">FIDUTRUST</h1>
        <h2 className="text-2xl md:text-3xl font-light text-[#C6A664] mb-8">{t('hero.tagline')}</h2>
        
        <p className="text-lg md:text-xl mb-6 max-w-3xl mx-auto text-gray-300">
          {t('hero.description')}
        </p>
        <p className="text-md mb-10 text-[#C6A664]">
          {t('hero.since')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
          <button 
            onClick={() => scrollToSection('societes')} 
            className="bg-[#C6A664] text-[#0D1B2A] px-8 py-4 rounded-lg font-semibold hover:bg-[#B89654] transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg"
          >
            {t('hero.discoverOffers')}
            <ArrowRight className="w-5 h-5" />
          </button>
          <button 
            onClick={() => scrollToSection('devis')} 
            className="border-2 border-[#C6A664] text-[#C6A664] px-8 py-4 rounded-lg hover:bg-[#C6A664] hover:text-[#0D1B2A] transition-all flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            {t('hero.requestQuote')}
          </button>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-[#C6A664]">-20%</div>
            <div className="text-sm text-gray-400">{t('hero.annualPayment')}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#C6A664]">24h</div>
            <div className="text-sm text-gray-400">{t('hero.responseTime')}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#C6A664]">100%</div>
            <div className="text-sm text-gray-400">{t('hero.digital')}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#C6A664]">1986</div>
            <div className="text-sm text-gray-400">{t('hero.foundation')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
