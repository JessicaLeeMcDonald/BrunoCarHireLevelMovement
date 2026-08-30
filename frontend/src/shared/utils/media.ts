const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5080/api';
const apiOrigin = new URL(apiBaseUrl, window.location.origin).origin;

export function toAbsoluteMediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiOrigin}${path}`;
}
