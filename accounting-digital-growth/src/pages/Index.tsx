
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

const Index: React.FC = () => {
  return (
    <LanguageProvider>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </LanguageProvider>
  );
};

export default Index;
