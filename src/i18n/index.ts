import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./en";
import { ko } from "./ko";

export type Lang = "ko" | "en";
export const LANG_KEY = "golfy-lang";
export const LANGS: Lang[] = ["ko", "en"];

/** saved choice, else the browser language, else Korean */
export function detectLanguage(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "ko" || saved === "en") return saved;
  } catch {}
  const browser = (typeof navigator !== "undefined" ? navigator.language : "") || "";
  if (/^en/i.test(browser)) return "en";
  return "ko";
}

i18n.use(initReactI18next).init({
  resources: { ko: { translation: ko }, en: { translation: en } },
  lng: detectLanguage(),
  fallbackLng: "en",
  supportedLngs: LANGS,
  interpolation: { escapeValue: false }, // React already escapes
  returnNull: false,
});

const applyHtmlLang = (lng: string) => {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lng;
  document.title = i18n.t("meta.title");
  document.querySelector('meta[name="description"]')?.setAttribute("content", i18n.t("meta.description"));
};
applyHtmlLang(i18n.language);
i18n.on("languageChanged", applyHtmlLang);

export function setLanguage(lang: Lang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {}
  return i18n.changeLanguage(lang);
}

export const currentLang = (): Lang => (i18n.language === "en" ? "en" : "ko");

export default i18n;
