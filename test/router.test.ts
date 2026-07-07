import { describe, expect, it } from 'vitest';
import { matchRoute } from '../src/routes/router';

describe('matchRoute', () => {
  it('matches svg-to-png route', () => {
    expect(matchRoute('/svg-to-png/https%3A%2F%2Fexample.com%2Flogo.svg')).toEqual({
      kind: 'svg-to-png',
      encodedSourceUrl: 'https%3A%2F%2Fexample.com%2Flogo.svg',
    });
  });

  it('matches transform route', () => {
    expect(matchRoute('/transform/png/https%3A%2F%2Fexample.com%2Flogo.svg')).toEqual({
      kind: 'transform',
      format: 'png',
      encodedSourceUrl: 'https%3A%2F%2Fexample.com%2Flogo.svg',
    });
  });

  it('returns null for unsupported route', () => {
    expect(matchRoute('/health')).toBeNull();
  });
});
