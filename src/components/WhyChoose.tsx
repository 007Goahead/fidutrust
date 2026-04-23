import React from 'react';
import { Brain, Settings, Handshake } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const WhyChoose = () => {
  const { t } = useLanguage();

  const reasons = [
    {
      icon: <Brain className="w-12 h-12" />,
      title: t('whyChoose.reason1Title'),
      description: t('whyChoose.reason1Desc')
    },
    {
      icon: <Settings className="w-12 h-12" />,
      title: t('whyChoose.reason2Title'),
      description: t('whyChoose.reason2Desc')
    },
    {
      icon: <Handshake className="w-12 h-12" />,
      title: t('whyChoose.reason3Title'),
      description: t('whyChoose.reason3Desc')
    }
  ];

  return (
    <section className="bg-[#0D1B2A] text-white py-20 px-5">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-serif text-[#C6A664] mb-12">
          {t('whyChoose.title')}
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {reasons.map((reason, index) => (
            <div 
              key={index}
              className="bg-white/5 p-8 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-all"
            >
              <div className="text-[#C6A664] mb-4 flex justify-center">{reason.icon}</div>
              <h3 className="text-2xl font-semibold mb-4 text-[#C6A664]">{reason.title}</h3>
              <p className="text-gray-300 leading-relaxed">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
