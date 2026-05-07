import { describe, expect, it } from 'vitest';
import { VERSION } from '../src/index';

describe('iconfont-sync', () => {
  it('should export VERSION', () => {
    expect(VERSION).toBe('pkg-version-for-test');
  });
});
