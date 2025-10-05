import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en/common.json";
import nl from "./locales/nl/common.json";

// Initialize i18next once. We keep react.useSuspense disabled for Next.js
// to avoid suspense-related server/client mismatches in this simple setup.
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { common: en },
      nl: { common: nl },
    },
    fallbackLng: "en",
    lng: "en",
    ns: ["common"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export default i18n;
