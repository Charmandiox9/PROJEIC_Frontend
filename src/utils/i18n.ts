import { LocalizedString } from "@/types/project";

type SupportedLanguage = "es" | "en" | "pt";

export function getLocalizedText(
  localizedObj: LocalizedString | null | undefined,
  currentLang: SupportedLanguage,
): string {
  if (!localizedObj) return "";

  return localizedObj[currentLang] || localizedObj.es || "Texto no disponible";
}
