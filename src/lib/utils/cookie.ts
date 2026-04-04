export function normalizeCookieForFrontendDomain(cookie: string): string {
  return cookie.replace(/;\s*domain=[^;]*/gi, '');
}