import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const { mockExtract } = vi.hoisted(() => ({
  mockExtract: vi.fn(),
}));

vi.mock('extract-zip', () => ({
  default: mockExtract,
}));

import { unzip } from '../src/unzip';

const TEST_DIR = resolve(import.meta.dirname, '__fixtures_unzip__');

describe('解压模块', () => {
  beforeAll(() => {
    if (!existsSync(TEST_DIR)) {
      mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    vi.clearAllMocks();
  });

  it('应将 zip 文件解压到输出目录', async () => {
    const zipPath = resolve(TEST_DIR, 'test.zip');
    writeFileSync(zipPath, 'fake-zip-content');

    const outputDir = resolve(TEST_DIR, 'output');

    const result = await unzip({ zipPath, outputDir });

    expect(mockExtract).toHaveBeenCalledWith(zipPath, {
      dir: resolve(outputDir),
    });
    expect(result).toBe(resolve(outputDir));
  });

  it('输出目录不存在时应自动创建', async () => {
    const zipPath = resolve(TEST_DIR, 'test.zip');
    writeFileSync(zipPath, 'fake-zip-content');

    const outputDir = resolve(TEST_DIR, 'nested', 'output');

    await unzip({ zipPath, outputDir });

    expect(existsSync(outputDir)).toBe(true);
    expect(mockExtract).toHaveBeenCalledWith(zipPath, {
      dir: resolve(outputDir),
    });
  });

  it('应返回解析后的输出目录路径', async () => {
    const zipPath = resolve(TEST_DIR, 'test.zip');
    writeFileSync(zipPath, 'fake-zip-content');

    const outputDir = './relative-output';

    const result = await unzip({ zipPath, outputDir });

    expect(result).toBe(resolve(outputDir));
  });
});
