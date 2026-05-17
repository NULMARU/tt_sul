import type { LanguageId } from "@shared/types/schema";

export const DEFAULT_LANGUAGE_ID: LanguageId = "en";

/**
 * Keep English on the legacy key so existing learners do not lose progress.
 * New languages get isolated IndexedDB payloads.
 */
export function userStateStoreKey(languageId: LanguageId = DEFAULT_LANGUAGE_ID): string {
  return languageId === "en"
    ? "sulsul-plus:user-state"
    : `sulsul-plus:user-state:${languageId}`;
}
