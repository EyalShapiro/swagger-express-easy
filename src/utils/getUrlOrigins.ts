export function getUrlHost(url?: string | null) {
  try {
    if (!url) return '';
    return new URL(url).host;
  } catch {
    return '';
  }
}
