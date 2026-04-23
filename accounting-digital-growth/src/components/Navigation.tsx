import React, { useState, useEffect } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/i18n/translations';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  ];

  const currentLang = languages.find(l => l.code === language);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all ${isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-5 py-4 flex justify-between items-center">
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="cursor-pointer"
        >
          <h1 className={`text-2xl font-serif font-bold ${isScrolled ? 'text-[#0D1B2A]' : 'text-white'}`}>
            FIDUTRUST
          </h1>
          <p className="text-xs text-[#C6A664]">Beyond Numbers</p>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => scrollToSection('societes')}
            className={`${isScrolled ? 'text-[#0D1B2A]' : 'text-white'} hover:text-[#C6A664] transition-colors`}
          >
            {t('nav.companies')}
          </button>
          <button 
            onClick={() => scrollToSection('independants')}
            className={`${isScrolled ? 'text-[#0D1B2A]' : 'text-white'} hover:text-[#C6A664] transition-colors`}
          >
            {t('nav.freelancers')}
          </button>
          <button 
            onClick={() => scrollToSection('honoraires')}
            className={`${isScrolled ? 'text-[#0D1B2A]' : 'text-white'} hover:text-[#C6A664] transition-colors`}
          >
            {t('nav.pricing')}
          </button>
          
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isScrolled 
                  ? 'text-[#0D1B2A] hover:bg-gray-100' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">{currentLang?.flag} {language.toUpperCase()}</span>
            </button>
            
            {langMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setLangMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                        language === lang.code ? 'bg-[#C6A664]/10 text-[#C6A664]' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-sm font-medium">{lang.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          
          <button 
            onClick={() => scrollToSection('devis')}
            className="bg-[#C6A664] text-white px-6 py-2 rounded-lg hover:bg-[#B89654] transition-all"
          >
            {t('nav.freeQuote')}
          </button>
        </div>
        
        <div className="flex items-center gap-4 md:hidden">
          {/* Mobile Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className={`flex items-center gap-1 px-2 py-1 rounded ${
                isScrolled ? 'text-[#0D1B2A]' : 'text-white'
              }`}
            >
              <span className="text-sm">{currentLang?.flag}</span>
            </button>
            
            {langMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setLangMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                        language === lang.code ? 'bg-[#C6A664]/10 text-[#C6A664]' : 'text-gray-700'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span className="text-sm">{lang.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`${isScrolled ? 'text-[#0D1B2A]' : 'text-white'}`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="flex flex-col p-5 space-y-4">
            <button 
              onClick={() => scrollToSection('societes')}
              className="text-[#0D1B2A] hover:text-[#C6A664] text-left"
            >
              {t('nav.companies')}
            </button>
            <button 
              onClick={() => scrollToSection('independants')}
              className="text-[#0D1B2A] hover:text-[#C6A664] text-left"
            >
              {t('nav.freelancers')}
            </button>
            <button 
              onClick={() => scrollToSection('honoraires')}
              className="text-[#0D1B2A] hover:text-[#C6A664] text-left"
            >
              {t('nav.pricing')}
            </button>
            <button 
              onClick={() => scrollToSection('devis')}
              className="bg-[#C6A664] text-white px-6 py-2 rounded-lg hover:bg-[#B89654]"
            >
              {t('nav.freeQuote')}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
