import React, { useState } from 'react';
import { Mail, Check, Send, MapPin, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Contact = () => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'societe',
    formula: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/create-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceForm: 'contact',
          contactName: formData.name,
          email: formData.email,
          structureType: formData.type,
          message: `${t('contact.desiredFormula')}: ${formData.formula || '-'}\n\n${formData.message}`,
          language,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      setSubmitted(true);
      setFormData({ name: '', email: '', type: 'societe', formula: '', message: '' });
      setTimeout(() => setSubmitted(false), 8000);
    } catch (err) {
      console.error('Contact form submission failed', err);
      setSubmitError(t('devis.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-20 px-5 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif text-[#0D1B2A] mb-6">
            {t('contact.title')}
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#0D1B2A] rounded-2xl p-6 text-white">
              <h3 className="text-xl font-semibold text-[#C6A664] mb-6">{t('contact.ourCoordinates')}</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#C6A664] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{t('contact.address')}</p>
                    <p className="text-gray-300 text-sm">Avenue Kersbeek 308<br />1180 Uccle, {language === 'nl' ? 'België' : language === 'en' ? 'Belgium' : 'Belgique'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#C6A664] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{t('contact.email')}</p>
                    <a href="mailto:Info@fidutrust.eu" className="text-gray-300 text-sm hover:text-[#C6A664] transition-colors">
                      Info@fidutrust.eu
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#C6A664] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{t('contact.hours')}</p>
                    <p className="text-gray-300 text-sm">{t('contact.hoursValue')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#C6A664]/10 border border-[#C6A664]/30 rounded-2xl p-6">
              <h4 className="font-semibold text-[#0D1B2A] mb-3">{t('contact.guaranteedResponse')}</h4>
              <p className="text-gray-600 text-sm">
                {t('contact.guaranteedResponseDesc')}
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-[#0D1B2A] mb-2">{t('contact.fullName')} *</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Jean Dupont"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#C6A664] focus:ring-2 focus:ring-[#C6A664]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0D1B2A] mb-2">{t('common.email')} *</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="jean@exemple.be"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#C6A664] focus:ring-2 focus:ring-[#C6A664]/20 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#0D1B2A] mb-2">{t('contact.clientType')} *</label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#C6A664] focus:ring-2 focus:ring-[#C6A664]/20 outline-none transition-all"
                >
                  <option value="societe">{t('contact.company')}</option>
                  <option value="independant">{t('contact.freelancer')}</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#0D1B2A] mb-2">{t('contact.desiredFormula')}</label>
                <select 
                  name="formula"
                  value={formData.formula}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#C6A664] focus:ring-2 focus:ring-[#C6A664]/20 outline-none transition-all"
                >
                  <option value="">{t('contact.selectFormula')}</option>
                  <option value="essentiel">{t('formulas.essential')}</option>
                  <option value="standard">{t('formulas.standard')}</option>
                  <option value="avance">{t('formulas.advanced')}</option>
                  <option value="premium">{t('formulas.premium')}</option>
                  <option value="sur-mesure">{t('contact.customQuote')}</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#0D1B2A] mb-2">{t('contact.message')}</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder={t('contact.messagePlaceholder')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#C6A664] focus:ring-2 focus:ring-[#C6A664]/20 outline-none transition-all resize-none"
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#C6A664] text-white py-4 rounded-lg font-semibold hover:bg-[#B89654] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {t('contact.sendRequest')}
              </button>

              {submitted && (
                <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  {t('contact.emailOpened')}
                </div>
              )}

              {submitError && (
                <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-lg flex items-center justify-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {submitError}
                </div>
              )}

              <p className="text-xs text-gray-500 text-center mt-4">
                {t('contact.privacyNotice')}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
