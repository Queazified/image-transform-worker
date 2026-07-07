import { HttpError } from './errors';
import type { TransformOptions } from '../types';

const COLOR_PATTERN = /^(#[0-9a-fA-F]{3,8}|rgba?\([^)]{1,40}\)|hsla?\([^)]{1,40}\)|[a-zA-Z]{1,20})$/;

function parsePositiveInt(value: string | null, field: string): number | undefined {
  if (value === null) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new HttpError(400, `Invalid ${field}. Must be a positive integer.`);
  }

  return parsed;
}

function parseQuality(value: string | null): number | undefined {
  if (value === null) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 100) {
    throw new HttpError(400, 'Invalid quality. Must be between 1 and 100.');
  }

  return parsed;
}

function parseBackground(value: string | null): string | undefined {
  if (value === null) {
    return undefined;
  }

  if (!COLOR_PATTERN.test(value)) {
    throw new HttpError(400, 'Invalid background color value.');
  }

  return value;
}

export function parseTransformOptions(searchParams: URLSearchParams): TransformOptions {
  return {
    width: parsePositiveInt(searchParams.get('width'), 'width'),
    height: parsePositiveInt(searchParams.get('height'), 'height'),
    quality: parseQuality(searchParams.get('quality')),
    background: parseBackground(searchParams.get('background')),
  };
}
