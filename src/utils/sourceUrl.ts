import { validateRemoteUrl } from './validation';

function isIpLiteral(hostname: string): boolean {
  // IPv4 literal
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) {
    return true;
  }

  // URL.hostname for IPv6 literals is unbracketed (e.g. "::1")
  return hostname.includes(':');
}

export function buildSourceFetchCandidates(sourceUrl: URL, blockedHostsRaw?: string): URL[] {
  const candidates = [new URL(sourceUrl.toString())];

  if (sourceUrl.hostname.startsWith('www.')) {
    const strippedHost = sourceUrl.hostname.slice(4);

    // Prevent rewriting into an IP literal (e.g. www.127.0.0.1 -> 127.0.0.1).
    if (!isIpLiteral(strippedHost)) {
      const withoutWww = new URL(sourceUrl.toString());
      withoutWww.hostname = strippedHost;

      try {
        validateRemoteUrl(withoutWww, blockedHostsRaw);
        candidates.push(withoutWww);
      } catch {
        // Ignore blocked fallback candidates.
      }
    }
  }

  return candidates;
}
