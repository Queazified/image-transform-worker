import { describe, expect, it } from 'vitest';
import { decodeImageUrl, validateRemoteUrl } from '../src/utils/validation';

describe('decodeImageUrl', () => {
  it('decodes a valid https URL', () => {
    const url = decodeImageUrl('https%3A%2F%2Fexample.com%2Fimage.svg');
    expect(url.toString()).toBe('https://example.com/image.svg');
  });

  it('rejects non-http protocols', () => {
    expect(() => decodeImageUrl('ftp%3A%2F%2Fexample.com%2Ffile.svg')).toThrow(
      'Only http and https URLs are allowed.'
    );
  });
});

describe('validateRemoteUrl', () => {
  it('rejects localhost/private hosts', () => {
    expect(() => validateRemoteUrl(new URL('http://localhost/test.svg'))).toThrow('Blocked host.');
    expect(() => validateRemoteUrl(new URL('http://127.0.0.1/test.svg'))).toThrow();
  });

  it('accepts public host', () => {
    expect(() => validateRemoteUrl(new URL('https://example.com/test.svg'))).not.toThrow();
  });
});
