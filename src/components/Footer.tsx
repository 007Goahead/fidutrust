import React from 'react';
import { MapPin, Mail, ArrowUp, Shield, Award, FileCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t, language } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0D1B2A] text-white">
      <div className="max-w-7xl mx-auto px-5 py-16">
        {/* Certifications Banner */}
        <div className="flex flex-wrap justify-center gap-8 mb-12 pb-12 border-b border-gray-700">
          <div className="flex items-center gap-2 text-gray-300">
            <Shield className="w-5 h-5 text-[#C6A664]" />
            <span className="text-sm">{t('footer.itaaCompliant')}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Award className="w-5 h-5 text-[#C6A664]" />
            <span className="text-sm">{t('footer.csaCompliant')}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <FileCheck className="w-5 h-5 text-[#C6A664]" />
            <span className="text-sm">{t('footer.peppol2026')}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-10 mb-10">
          <div>
            <h3 className="text-2xl font-serif text-[#C6A664] mb-4">FIDUTRUST</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              {t('footer.tagline')}<br />
              {t('footer.description')}<br />
              {t('footer.since')}
            </p>
            <p className="text-xs text-gray-500">
              {t('footer.accountingTaxAdvice')}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-[#C6A664] mb-4">{t('footer.services')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => scrollToSection('societes')} 
                  className="text-gray-300 hover:text-[#C6A664] transition-colors"
                >
                  {t('footer.companies')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('independants')} 
                  className="text-gray-300 hover:text-[#C6A664] transition-colors"
                >
                  {t('footer.freelancers')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('honoraires')} 
                  className="text-gray-300 hover:text-[#C6A664] transition-colors"
                >
                  {t('footer.pricingFees')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('contact')} 
                  className="text-gray-300 hover:text-[#C6A664] transition-colors"
                >
                  {t('footer.companyCreation')}
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-[#C6A664] mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-[#C6A664] flex-shrink-0" />
                <span>Avenue Kersbeek 308<br />1180 Uccle, {language === 'nl' ? 'België' : language === 'en' ? 'Belgium' : 'Belgique'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C6A664] flex-shrink-0" />
                <a href="mailto:Info@fidutrust.eu" className="hover:text-[#C6A664] transition-colors">
                  Info@fidutrust.eu
                </a>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-400">FIDUTRUST SRL</p>
              <p className="text-xs text-gray-500">TVA : BE 1032.395.843</p>
            </div>
          </div>
        </div>

        
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © 2026 FIDUTRUST SRL. {t('footer.allRightsReserved')}
          </p>
          <button 
            onClick={scrollToTop} 
            className="flex items-center gap-2 text-[#C6A664] hover:text-white transition-colors"
          >
            <ArrowUp className="w-4 h-4" />
            {t('footer.backToTop')}
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
