import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import commonEN from "./en/common.json";
import commonID from "./id/common.json";

export const defaultNS = "common";
export const resources = {
  id: { common: commonID },
  en: { common: commonEN },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: "id", // Default language is Indonesian
    fallbackLng: "id",
    debug: false,
    defaultNS,
    ns: ["common"],
    interpolation: {
      escapeValue: false, // React handles escaping XSS
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
