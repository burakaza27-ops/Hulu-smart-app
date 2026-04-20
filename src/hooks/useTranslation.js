import useStore from '../store/useStore';
import { getTranslation } from '../i18n/translations';

/**
 * Custom hook returning a translator function bound to the current language.
 * Usage: const t = useTranslation(); ... t('dash.greeting')
 */
export default function useTranslation() {
  const language = useStore((state) => state.language);
  return (key, fallback) => getTranslation(key, language, fallback);
}
