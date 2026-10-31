import React from "react";
import { useTranslation } from "react-i18next";
import { LANGS, Lang, setLanguage } from "../../i18n";

const LABEL: Record<Lang, string> = { ko: "KO", en: "EN" };
const NAME: Record<Lang, string> = { ko: "한국어", en: "English" };

/** KO | EN switch; the choice is remembered in localStorage and sets <html lang> */
export function LangToggle({ className = "" }: { className?: string }) {
  const { t, i18n } = useTranslation();
  return (
    <div className={`g-lang ${className}`} role="group" aria-label={t("lang.label")}>
      {LANGS.map((lang) => (
        <button
          key={lang}
          type="button"
          lang={lang}
          className="g-lang-btn"
          aria-pressed={i18n.language === lang}
          aria-label={NAME[lang]}
          title={NAME[lang]}
          onClick={() => setLanguage(lang)}
        >
          {LABEL[lang]}
        </button>
      ))}
    </div>
  );
}
