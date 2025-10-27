import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi) // loads translations from your public/locales folder
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    fallbackLng: 'en', // use English if detected language is not available
    debug: true, // logs info to console
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;