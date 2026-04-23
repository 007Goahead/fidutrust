import React from 'react';
import { Calculator, FileText, TrendingUp, Shield, User, Briefcase, FileCheck, Receipt, PiggyBank } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ServicesIndependants = () => {
  const { t } = useLanguage();

  const serviceCategories = [
    {
      title: t('servicesFreelancers.accountingTax'),
      icon: <Calculator className="w-8 h-8" />,
      color: 'bg-[#C6A664]',
      services: [
        t('servicesFreelancers.service1_1'),
        t('servicesFreelancers.service1_2'),
        t('servicesFreelancers.service1_3'),
        t('servicesFreelancers.service1_4'),
        t('servicesFreelancers.service1_5'),
        t('servicesFreelancers.service1_6'),
      ]
    },
    {
      title: t('servicesFreelancers.consultingOptimization'),
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'bg-blue-500',
      services: [
        t('servicesFreelancers.service2_1'),
        t('servicesFreelancers.service2_2'),
        t('servicesFreelancers.service2_3'),
        t('servicesFreelancers.service2_4'),
        t('servicesFreelancers.service2_5'),
        t('servicesFreelancers.service2_6'),
      ]
    },
    {
      title: t('servicesFreelancers.startupCompliance'),
      icon: <Shield className="w-8 h-8" />,
      color: 'bg-green-500',
      services: [
        t('servicesFreelancers.service3_1'),
        t('servicesFreelancers.service3_2'),
        t('servicesFreelancers.service3_3'),
        t('servicesFreelancers.service3_4'),
        t('servicesFreelancers.service3_5'),
        t('servicesFreelancers.service3_6'),
      ]
    }
  ];

  const benefits = [
    { icon: <Receipt className="w-6 h-6" />, text: t('servicesFreelancers.benefit1') },
    { icon: <PiggyBank className="w-6 h-6" />, text: t('servicesFreelancers.benefit2') },
    { icon: <User className="w-6 h-6" />, text: t('servicesFreelancers.benefit3') },
  ];

  return (
    <section id="independants" className="bg-gradient-to-b from-white to-gray-50 py-20 px-5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#C6A664] text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <User className="w-4 h-4" />
            {t('servicesFreelancers.forFreelancers')}
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-[#0D1B2A] mb-4">
            {t('servicesFreelancers.title')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('servicesFreelancers.subtitle')}
          </p>
        </div>

        {/* Benefits Banner */}
        <div className="bg-[#0D1B2A] rounded-2xl p-6 mb-12">
          <div className="flex flex-wrap justify-center gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 text-white">
                <div className="text-[#C6A664]">{benefit.icon}</div>
                <span className="text-sm font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {serviceCategories.map((category, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              <div className={`${category.color} p-6 text-white`}>
                <div className="flex items-center gap-4">
                  {category.icon}
                  <h3 className="text-xl font-semibold">{category.title}</h3>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {category.services.map((service, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                      <FileCheck className="w-4 h-4 text-[#C6A664] mt-1 flex-shrink-0" />
                      <span className="text-sm">{service}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => {
              const element = document.getElementById('formules-independants');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-[#C6A664] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#B89654] transition-all inline-flex items-center gap-2"
          >
            <Briefcase className="w-5 h-5" />
            {t('servicesFreelancers.viewPackages')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesIndependants;
