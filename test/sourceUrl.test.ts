import { describe, expect, it } from 'vitest';
import { buildSourceFetchCandidates } from '../src/utils/sourceUrl';

describe('buildSourceFetchCandidates', () => {
  it('includes non-www fallback for www hosts', () => {
    const candidates = buildSourceFetchCandidates(
      new URL('https://www.tvchannellists.com/wiki/images/4/42/Sky_Sports_Main_Event_HD.svg')
    );

    expect(candidates.map((value) => value.toString())).toEqual([
      'https://www.tvchannellists.com/wiki/images/4/42/Sky_Sports_Main_Event_HD.svg',
      'https://tvchannellists.com/wiki/images/4/42/Sky_Sports_Main_Event_HD.svg',
    ]);
  });

  it('does not add fallback for non-www hosts', () => {
    const candidates = buildSourceFetchCandidates(new URL('https://example.com/logo.svg'));
    expect(candidates.map((value) => value.toString())).toEqual(['https://example.com/logo.svg']);
  });

  it('does not add fallback when stripped host is blocked by default rules', () => {
    const candidates = buildSourceFetchCandidates(new URL('https://www.localhost/logo.svg'));
    expect(candidates.map((value) => value.toString())).toEqual(['https://www.localhost/logo.svg']);
  });

  it('does not add fallback when stripped host is blocked by custom rules', () => {
    const candidates = buildSourceFetchCandidates(
      new URL('https://www.example.com/logo.svg'),
      'example.com'
    );
    expect(candidates.map((value) => value.toString())).toEqual(['https://www.example.com/logo.svg']);
  });
});
