import React from 'react';
import Navigation from './Navigation';
import Hero from './Hero';
import Presentation from './Presentation';
import ServicesSocietes from './ServicesSocietes';
import FormulesSocietes from './FormulesSocietes';
import ServicesIndependants from './ServicesIndependants';
import FormulesIndependants from './FormulesIndependants';
import Honoraires from './Honoraires';
import DemandeDevis from './DemandeDevis';
import WhyChoose from './WhyChoose';
import FAQ from './FAQ';
import Contact from './Contact';
import Footer from './Footer';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-serif">
      <Navigation />
      <Hero />
      <Presentation />
      <ServicesSocietes />
      <FormulesSocietes />
      <ServicesIndependants />
      <FormulesIndependants />
      <Honoraires />
      <DemandeDevis />
      <WhyChoose />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
};

export default AppLayout;
