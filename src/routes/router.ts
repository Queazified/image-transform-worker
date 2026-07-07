import type { RouteMatch } from '../types';

export function matchRoute(pathname: string): RouteMatch | null {
  const cleanPath = pathname.replace(/^\/+/, '');
  const parts = cleanPath.split('/');

  if (parts.length >= 2 && parts[0] === 'svg-to-png') {
    return {
      kind: 'svg-to-png',
      encodedSourceUrl: parts.slice(1).join('/'),
    };
  }

  if (parts.length >= 3 && parts[0] === 'transform') {
    return {
      kind: 'transform',
      format: parts[1].toLowerCase(),
      encodedSourceUrl: parts.slice(2).join('/'),
    };
  }

  return null;
}
