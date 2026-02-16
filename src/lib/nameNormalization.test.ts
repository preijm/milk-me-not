import { describe, it, expect } from 'vitest';
import { normalizeName, isSimilar, similarityScore, findClosestMatch } from './nameNormalization';

describe('normalizeName', () => {
  it('trims whitespace', () => {
    expect(normalizeName('  Oatly  ')).toBe('Oatly');
  });

  it('collapses multiple spaces', () => {
    expect(normalizeName('Alpro  Barista   Oat')).toBe('Alpro Barista Oat');
  });

  it('handles empty string', () => {
    expect(normalizeName('   ')).toBe('');
  });

  it('preserves original casing', () => {
    expect(normalizeName('oatly')).toBe('oatly');
    expect(normalizeName('OATLY')).toBe('OATLY');
  });
});

describe('similarityScore', () => {
  it('returns 1 for identical strings', () => {
    expect(similarityScore('Oatly', 'Oatly')).toBe(1);
  });

  it('returns 1 for case-insensitive identical strings', () => {
    expect(similarityScore('Oatly', 'oatly')).toBe(1);
  });

  it('returns high score for similar strings', () => {
    expect(similarityScore('Oatlly', 'Oatly')).toBeGreaterThan(0.75);
  });

  it('returns low score for dissimilar strings', () => {
    expect(similarityScore('Oatly', 'Alpro')).toBeLessThan(0.5);
  });
});

describe('isSimilar', () => {
  it('detects similar names', () => {
    expect(isSimilar('Oatlly', 'Oatly')).toBe(true);
  });

  it('rejects dissimilar names', () => {
    expect(isSimilar('Oatly', 'Alpro')).toBe(false);
  });
});

describe('findClosestMatch', () => {
  const items = [
    { id: '1', name: 'Oatly' },
    { id: '2', name: 'Alpro' },
    { id: '3', name: 'Sproud' },
  ];

  it('finds a close match', () => {
    const result = findClosestMatch('Oatlly', items);
    expect(result?.name).toBe('Oatly');
  });

  it('returns null when no match above threshold', () => {
    const result = findClosestMatch('Something Completely Different', items);
    expect(result).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(findClosestMatch('', items)).toBeNull();
  });
});
