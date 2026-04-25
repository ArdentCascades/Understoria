import { useTranslation } from "react-i18next";
import {
  LANGUAGE_LABELS,
  setLanguage,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "@/i18n";

export function LanguageSection() {
  const { t, i18n } = useTranslation();
  const current = (i18n.resolvedLanguage ?? "en") as SupportedLanguage;
  return (
    <section className="card mb-4" aria-labelledby="language-section-title">
      <h2
        id="language-section-title"
        className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500"
      >
        {t("profile.language.title")}
      </h2>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("profile.language.intro")}
      </p>
      <div
        role="radiogroup"
        aria-labelledby="language-section-title"
        className="flex flex-wrap gap-2"
      >
        {SUPPORTED_LANGUAGES.map((lang) => {
          const selected = current === lang;
          return (
            <button
              key={lang}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setLanguage(lang)}
              className={
                selected
                  ? "btn-primary"
                  : "btn-secondary"
              }
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          );
        })}
      </div>
    </section>
  );
}
