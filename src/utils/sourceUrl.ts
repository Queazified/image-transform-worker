export function buildSourceFetchCandidates(sourceUrl: URL): URL[] {
  const candidates = [new URL(sourceUrl.toString())];

  if (sourceUrl.hostname.startsWith('www.')) {
    const withoutWww = new URL(sourceUrl.toString());
    withoutWww.hostname = sourceUrl.hostname.slice(4);
    candidates.push(withoutWww);
  }

  return candidates;
}
