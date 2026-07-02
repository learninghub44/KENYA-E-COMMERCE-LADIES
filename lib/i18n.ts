type Locale = "en-KE" | "sw-KE"

const locales: Locale[] = ["en-KE", "sw-KE"]
const defaultLocale: Locale = "en-KE"

interface LocaleConfig {
  code: Locale
  label: string
  dir: "ltr" | "rtl"
  flag: string
}

const localeConfig: Record<Locale, LocaleConfig> = {
  "en-KE": { code: "en-KE", label: "English (Kenya)", dir: "ltr", flag: "🇰🇪" },
  "sw-KE": { code: "sw-KE", label: "Kiswahili (Kenya)", dir: "ltr", flag: "🇰🇪" },
}

function getLocaleDir(locale: string): "ltr" | "rtl" {
  return locale in localeConfig ? localeConfig[locale as Locale].dir : "ltr"
}

function formatCurrency(amount: number, locale: string = "en-KE", currency: string = "KES"): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `KES ${amount.toFixed(2)}`
  }
}

function formatDate(date: Date | string | number, locale: string = "en-KE", options?: Intl.DateTimeFormatOptions): string {
  try {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date
    return new Intl.DateTimeFormat(locale, options).format(d)
  } catch {
    return new Date(date).toLocaleDateString()
  }
}

function formatRelativeTime(date: Date | string | number, locale: string = "en-KE"): string {
  const now = Date.now()
  const then = typeof date === "string" || typeof date === "number" ? new Date(date).getTime() : date.getTime()
  const diffMs = now - then
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
    if (diffSeconds < 60) return rtf.format(-diffSeconds, "second")
    if (diffMinutes < 60) return rtf.format(-diffMinutes, "minute")
    if (diffHours < 24) return rtf.format(-diffHours, "hour")
    if (diffDays < 30) return rtf.format(-diffDays, "day")
    return formatDate(date, locale)
  } catch {
    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    if (diffMinutes > 0) return `${diffMinutes}m ago`
    return "just now"
  }
}

function formatNumber(num: number, locale: string = "en-KE"): string {
  try {
    return new Intl.NumberFormat(locale).format(num)
  } catch {
    return num.toString()
  }
}

type TranslationValues = Record<string, string | number | boolean | Date>
type TranslationFunction = (key: string, values?: TranslationValues) => string

function createTranslator(messages: Record<string, string>): TranslationFunction {
  return (key: string, values?: TranslationValues) => {
    let message = messages[key] ?? key
    if (values) {
      for (const [k, v] of Object.entries(values)) {
        message = message.replace(`{${k}}`, String(v))
      }
    }
    return message
  }
}

export {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatNumber,
  createTranslator,
  getLocaleDir,
  locales,
  defaultLocale,
  type Locale,
  type LocaleConfig,
  type TranslationFunction,
  type TranslationValues,
}
