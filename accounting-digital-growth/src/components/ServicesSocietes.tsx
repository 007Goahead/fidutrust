import React from 'react';
import { Calculator, FileText, TrendingUp, Scale, Shield, Users, Building, Briefcase, FileCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ServicesSocietes = () => {
  const { t } = useLanguage();

  const serviceCategories = [
    {
      title: t('servicesCompanies.accountingTax'),
      icon: <Calculator className="w-8 h-8" />,
      color: 'bg-blue-500',
      services: [
        t('servicesCompanies.service1_1'),
        t('servicesCompanies.service1_2'),
        t('servicesCompanies.service1_3'),
        t('servicesCompanies.service1_4'),
        t('servicesCompanies.service1_5'),
        t('servicesCompanies.service1_6'),
      ]
    },
    {
      title: t('servicesCompanies.consultingSupport'),
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'bg-[#C6A664]',
      services: [
        t('servicesCompanies.service2_1'),
        t('servicesCompanies.service2_2'),
        t('servicesCompanies.service2_3'),
        t('servicesCompanies.service2_4'),
        t('servicesCompanies.service2_5'),
        t('servicesCompanies.service2_6'),
      ]
    },
    {
      title: t('servicesCompanies.complianceObligations'),
      icon: <Shield className="w-8 h-8" />,
      color: 'bg-green-500',
      services: [
        t('servicesCompanies.service3_1'),
        t('servicesCompanies.service3_2'),
        t('servicesCompanies.service3_3'),
        t('servicesCompanies.service3_4'),
        t('servicesCompanies.service3_5'),
        t('servicesCompanies.service3_6'),
      ]
    }
  ];

  return (
    <section id="societes" className="bg-gradient-to-b from-gray-50 to-white py-20 px-5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#0D1B2A] text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Building className="w-4 h-4" />
            {t('servicesCompanies.forCompanies')}
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-[#0D1B2A] mb-4">
            {t('servicesCompanies.title')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('servicesCompanies.subtitle')}
          </p>
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
              const element = document.getElementById('formules-societes');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-[#0D1B2A] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#1a2d47] transition-all inline-flex items-center gap-2"
          >
            <Briefcase className="w-5 h-5" />
            {t('servicesCompanies.viewPackages')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSocietes;
