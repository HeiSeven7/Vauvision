import { createI18n } from "vue-i18n"
import pluralRules from "@/i18n/rules/pluralization.ts"
import numberFormats from "@/i18n/rules/numbers.ts"
import datetimeFormats from "@/i18n/rules/datetime.ts"
import en from "@/i18n/locales/en.json"
import ru from "@/i18n/locales/ru.json"

export default createI18n({
  locale: import.meta.env.VITE_DEFAULT_LOCALE,
  fallbackLocale: import.meta.env.VITE_FALLBACK_LOCALE,
  legacy: false,
  globalInjection: true,
  messages: { en, ru },
  runtimeOnly: false,
  pluralRules,
  numberFormats,
  datetimeFormats,
})