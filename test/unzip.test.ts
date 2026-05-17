import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const { mockExtract, mockCp, mockReaddir, mockRm, mockTmpdir, mockUniqueString } = vi.hoisted(() => ({
  mockExtract: vi.fn<() => Promise<void>>(),
  mockCp: vi.fn<() => Promise<void>>(),
  mockReaddir: vi.fn<() => Promise<unknown[]>>(),
  mockRm: vi.fn<() => Promise<void>>(),
  mockTmpdir: vi.fn<() => string>(() => '/tmp'),
  mockUniqueString: vi.fn<() => string>(() => 'abc123'),
}));

vi.mock('extract-zip', () => ({
  default: mockExtract,
}));

vi.mock('node:fs/promises', () => ({
  cp: mockCp,
  readdir: mockReaddir,
  rm: mockRm,
}));

vi.mock('node:os', () => ({
  tmpdir: mockTmpdir,
}));

vi.mock('@cloudcome/utils-core/unique', () => ({
  uniqueString: mockUniqueString,
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

  it('应将 zip 解压到临时目录，再复制到输出目录', async () => {
    mockReaddir.mockResolvedValue([
      { name: 'file1.css', isDirectory: () => false },
      { name: 'file2.js', isDirectory: () => false },
    ]);

    const zipPath = resolve(TEST_DIR, 'test.zip');
    writeFileSync(zipPath, 'fake-zip-content');

    const outputDir = resolve(TEST_DIR, 'output');

    const result = await unzip({ zipPath, outputDir });

    expect(mockExtract).toHaveBeenCalledWith(zipPath, {
      dir: '/tmp/iconfont-sync-abc123',
    });
    expect(mockCp).toHaveBeenCalledWith('/tmp/iconfont-sync-abc123', resolve(outputDir), { recursive: true });
    expect(mockRm).toHaveBeenCalledWith('/tmp/iconfont-sync-abc123', {
      recursive: true,
      force: true,
    });
    expect(result).toBe(outputDir);
  });

  it('输出目录不存在时应自动创建', async () => {
    mockReaddir.mockResolvedValue([{ name: 'file.css', isDirectory: () => false }]);

    const zipPath = resolve(TEST_DIR, 'test.zip');
    writeFileSync(zipPath, 'fake-zip-content');

    const outputDir = resolve(TEST_DIR, 'nested', 'output');

    await unzip({ zipPath, outputDir });

    expect(existsSync(outputDir)).toBe(true);
  });

  it('应返回解析后的输出目录路径', async () => {
    mockReaddir.mockResolvedValue([{ name: 'file.css', isDirectory: () => false }]);

    const zipPath = resolve(TEST_DIR, 'test.zip');
    writeFileSync(zipPath, 'fake-zip-content');

    const outputDir = './relative-output';

    const result = await unzip({ zipPath, outputDir });

    expect(result).toBe(outputDir);
  });

  it('解压结果只有一个文件夹时应扁平化', async () => {
    mockReaddir.mockResolvedValue([{ name: 'font_123456', isDirectory: () => true }]);

    const zipPath = resolve(TEST_DIR, 'test.zip');
    writeFileSync(zipPath, 'fake-zip-content');

    const outputDir = resolve(TEST_DIR, 'output');

    await unzip({ zipPath, outputDir });

    expect(mockCp).toHaveBeenCalledWith('/tmp/iconfont-sync-abc123/font_123456', resolve(outputDir), {
      recursive: true,
    });
  });

  it('解压失败时也应清理临时目录', async () => {
    mockExtract.mockRejectedValueOnce(new Error('extract failed'));

    const zipPath = resolve(TEST_DIR, 'test.zip');
    writeFileSync(zipPath, 'fake-zip-content');

    const outputDir = resolve(TEST_DIR, 'output');

    await expect(unzip({ zipPath, outputDir })).rejects.toThrow('extract failed');

    expect(mockRm).toHaveBeenCalledWith('/tmp/iconfont-sync-abc123', {
      recursive: true,
      force: true,
    });
  });
});
