import { describe, expect, it } from 'vitest';
import { version } from '../package.json';
import { VERSION } from '../src/const';

describe('iconfont-sync', () => {
  it('should export VERSION', () => {
    expect(VERSION).toBe(version);
  });
});
