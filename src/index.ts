import { convertSvgToPng } from './processors/svgToPng';
import { matchRoute } from './routes/router';
import type { TransformOptions } from './types';
import { handlePreflight, withCors } from './utils/cors';
import { HttpError } from './utils/errors';
import { parseTransformOptions } from './utils/options';
import { buildSourceFetchCandidates } from './utils/sourceUrl';
import { decodeImageUrl, readWithLimit, validateRemoteUrl } from './utils/validation';

interface Env {
  BLOCKED_HOSTS?: string;
}

const CACHE_CONTROL = 'public, max-age=300, s-maxage=86400';

function jsonError(status: number, message: string): Response {
  return withCors(
    new Response(JSON.stringify({ error: message }), {
      status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  );
}

function createCacheResponse(body: Uint8Array): Response {
  const copy = Uint8Array.from(body);
  return new Response(copy, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': CACHE_CONTROL,
    },
  });
}

async function processSvgToPng(
  sourceUrl: URL,
  options: TransformOptions,
  blockedHostsRaw?: string
): Promise<Response> {
  let lastStatus = 502;
  let upstreamResponse: Response | null = null;

  for (const candidateUrl of buildSourceFetchCandidates(sourceUrl, blockedHostsRaw)) {
    try {
      const response = await fetch(candidateUrl.toString(), {
        method: 'GET',
        redirect: 'follow',
        cf: {
          cacheEverything: false,
        },
      });

      if (response.ok) {
        upstreamResponse = response;
        break;
      }

      response.body?.cancel();
      lastStatus = response.status;
    } catch {
      lastStatus = 502;
    }
  }

  if (!upstreamResponse) {
    throw new HttpError(lastStatus, 'Failed to fetch source image.');
  }

  const svg = await readWithLimit(upstreamResponse, 'image/svg+xml');
  const pngBytes = await convertSvgToPng(svg, options);
  return createCacheResponse(pngBytes);
}

async function handleTransformRequest(request: Request, env: Env): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return handlePreflight();
  }

  if (request.method !== 'GET') {
    return jsonError(405, 'Method not allowed.');
  }

  const requestUrl = new URL(request.url);
  const route = matchRoute(requestUrl.pathname);

  if (!route || !route.encodedSourceUrl) {
    return jsonError(404, 'Route not found.');
  }

  const cache = await caches.open('image-transform-cache-v1');
  const cacheKey = new Request(request.url, { method: 'GET' });
  const cached = await cache.match(cacheKey);
  if (cached) {
    return withCors(cached);
  }

  const sourceUrl = decodeImageUrl(route.encodedSourceUrl);
  validateRemoteUrl(sourceUrl, env.BLOCKED_HOSTS);

  const options = parseTransformOptions(requestUrl.searchParams);

  let response: Response;
  if (route.kind === 'svg-to-png') {
    response = await processSvgToPng(sourceUrl, options, env.BLOCKED_HOSTS);
  } else {
    if (route.format !== 'png') {
      throw new HttpError(400, `Unsupported format '${route.format}'.`);
    }

    response = await processSvgToPng(sourceUrl, options, env.BLOCKED_HOSTS);
  }

  await cache.put(cacheKey, response.clone());
  return withCors(response);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await handleTransformRequest(request, env);
    } catch (error) {
      if (error instanceof HttpError) {
        return jsonError(error.status, error.message);
      }

      return jsonError(500, 'Internal server error.');
    }
  },
};
