/**
 * Returns the base URL for assets from the Vite environment.
 * Falls back to '/' if BASE_URL is not set.
 */
export function getBaseUrl(): string {
  return import.meta.env.BASE_URL || '/';
}
