import { describe, expect, it } from 'vitest';
import { parseTransformOptions } from '../src/utils/options';

describe('parseTransformOptions', () => {
  it('parses supported query values', () => {
    const options = parseTransformOptions(
      new URLSearchParams({ width: '512', height: '256', quality: '80', background: '#ffffff' })
    );

    expect(options).toEqual({ width: 512, height: 256, quality: 80, background: '#ffffff' });
  });

  it('rejects invalid width', () => {
    expect(() => parseTransformOptions(new URLSearchParams({ width: '0' }))).toThrow(
      'Invalid width. Must be a positive integer.'
    );
  });
});
