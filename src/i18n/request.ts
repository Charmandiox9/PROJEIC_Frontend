import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export const locales = ["es", "en", "pt"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

export default getRequestConfig(async () => {
  // Lee el locale preferido desde una cookie; si no existe, usa el default.
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale =
    cookieLocale && (locales as readonly string[]).includes(cookieLocale)
      ? (cookieLocale as Locale)
      : defaultLocale;

  return {
    locale,
    // Forzar recarga para pt.json
    messages: (await import(`./${locale}.json`)).default,
  };
});
