import { createContext, useContext, useState } from 'react';
import tr from '../i18n/tr';
import en from '../i18n/en';

const LangContext = createContext(null);

const translations = { tr, en };

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'tr');

  const toggleLang = () => {
    const next = lang === 'tr' ? 'en' : 'tr';
    setLang(next);
    localStorage.setItem('lang', next);
  };

  const t = translations[lang];

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
