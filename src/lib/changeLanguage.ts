"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * Returns the new path with the updated locale.
 * @param pathname - actual path (usePathname())
 * @param currentLocale - current language ("en", "fr")
 * @param newLocale - target language ("en", "fr")
 */
export function getLanguagePath(
  pathname: string,
  currentLocale: string,
  newLocale: string
): string {
  return pathname.replace(`/${currentLocale}`, `/${newLocale}`);
}
