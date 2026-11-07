import { useApp } from '../context/AppContext';
import type { Bi } from './journey';

/** Bilingual helper: `t('English', 'বাংলা')` and `bi({en, bn})`. */
export const useT = () => {
  const { lang, setLang } = useApp();
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en);
  const bi = (b: Bi) => (lang === 'bn' ? b.bn : b.en);
  return { lang, setLang, t, bi };
};

export const INK = '#172521';
export const GREEN = '#124B3A';
export const LIME = '#CBEA70';
export const PAPER = '#FAF9F5';
export const RED = '#B42318';

export const formatWhen = (iso: string, lang: 'en' | 'bn') => {
  try {
    return new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Dhaka'
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};
