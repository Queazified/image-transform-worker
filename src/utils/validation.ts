import { HttpError } from './errors';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const DEFAULT_BLOCKED_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  '0.0.0.0',
  '169.254.169.254',
  'metadata.google.internal',
]);

function isPrivateIPv4(hostname: string): boolean {
  const parts = hostname.split('.').map((part) => Number.parseInt(part, 10));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return false;
  }

  const [a, b] = parts;
  return (
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a === 127 ||
    (a === 169 && b === 254)
  );
}

function isPrivateIPv6(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return (
    normalized === '::1' ||
    normalized === '::' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe80:')
  );
}

export function decodeImageUrl(encodedUrl: string): URL {
  let decoded: string;
  try {
    decoded = decodeURIComponent(encodedUrl);
  } catch {
    throw new HttpError(400, 'Invalid encoded image URL.');
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(decoded);
  } catch {
    throw new HttpError(400, 'Invalid image URL.');
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new HttpError(400, 'Only http and https URLs are allowed.');
  }

  return parsedUrl;
}

export function validateRemoteUrl(url: URL, blockedHostsRaw?: string): void {
  const hostname = url.hostname.toLowerCase();

  const blockedHosts = new Set(DEFAULT_BLOCKED_HOSTS);
  if (blockedHostsRaw) {
    for (const host of blockedHostsRaw.split(',').map((value) => value.trim().toLowerCase()).filter(Boolean)) {
      blockedHosts.add(host);
    }
  }

  if (blockedHosts.has(hostname) || hostname.endsWith('.local')) {
    throw new HttpError(403, 'Blocked host.');
  }

  if (isPrivateIPv4(hostname) || isPrivateIPv6(hostname)) {
    throw new HttpError(403, 'Private or loopback IP addresses are not allowed.');
  }
}

export async function readWithLimit(response: Response, expectedContentType: string): Promise<string> {
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
  if (!contentType.includes(expectedContentType)) {
    throw new HttpError(415, `Expected ${expectedContentType} content type.`);
  }

  const contentLength = Number.parseInt(response.headers.get('content-length') ?? '', 10);
  if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_BYTES) {
    throw new HttpError(413, `Image exceeds ${MAX_IMAGE_BYTES} byte limit.`);
  }

  const body = await response.arrayBuffer();
  if (body.byteLength > MAX_IMAGE_BYTES) {
    throw new HttpError(413, `Image exceeds ${MAX_IMAGE_BYTES} byte limit.`);
  }

  return new TextDecoder().decode(body);
}

export { MAX_IMAGE_BYTES };
