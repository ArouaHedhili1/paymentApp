import i18n from "i18next";
import { initReactI18next  } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';


i18n
.use(Backend)
  .use(initReactI18next ) // passes i18n down to react-i18next
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  .init({
    //lng: "en",
    ns: ['general'],
    defaultNS: 'general',
    fallbackLng: "fr",
    react: { 
      useSuspense: false //   <---- this will do the magic
    },
    //keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false // react already safes from xss
    },
    backend: {      
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },
  });
  localStorage.setItem("CurrentCulture",(i18n.options && i18n.options.lng) || "fr");
  
export default i18n;