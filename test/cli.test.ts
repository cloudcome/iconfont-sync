import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

const { mockConfirm, mockIntro, mockOutro, mockCancel, mockLog, mockSpinner, mockText, mockIsCancel } = vi.hoisted(
  () => ({
    mockConfirm: vi.fn<() => Promise<unknown>>(),
    mockIntro: vi.fn<() => void>(),
    mockOutro: vi.fn<() => void>(),
    mockCancel: vi.fn<(msg: string) => void>(),
    mockLog: {
      warn: vi.fn<(msg: string) => void>(),
      success: vi.fn<(msg: string) => void>(),
      step: vi.fn<(msg: string) => void>(),
      error: vi.fn<(msg: string) => void>(),
      info: vi.fn<(msg: string) => void>(),
    },
    mockSpinner: vi.fn<() => { start: () => void; stop: () => void }>(() => ({
      start: vi.fn<() => void>(),
      stop: vi.fn<() => void>(),
    })),
    mockText: vi.fn<() => Promise<unknown>>(),
    mockIsCancel: vi.fn<(value: unknown) => boolean>(() => false),
  }),
);

vi.mock('@clack/prompts', () => ({
  intro: mockIntro,
  outro: mockOutro,
  confirm: mockConfirm,
  cancel: mockCancel,
  log: mockLog,
  spinner: mockSpinner,
  text: mockText,
  isCancel: mockIsCancel,
}));

vi.mock('../src/download', () => ({
  downloadResource: vi.fn<() => Promise<string>>().mockResolvedValue('/fake/path/download.zip'),
}));

vi.mock('../src/unzip', () => ({
  unzip: vi.fn<() => Promise<string>>().mockResolvedValue('/fake/path/output'),
}));

vi.mock('../src/build', () => ({
  buildTypes: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
}));

import { runCommand } from '../src/cli';

const TEST_DIR = resolve(import.meta.dirname, '__fixtures_cli__');
const CONFIG_PATH = resolve(TEST_DIR, '.iconfont-sync.json');

describe('命令行模块', () => {
  beforeAll(() => {
    if (!existsSync(TEST_DIR)) {
      mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    if (existsSync(CONFIG_PATH)) {
      rmSync(CONFIG_PATH);
    }
    vi.clearAllMocks();
  });

  describe('运行命令', () => {
    it('配置文件存在时应执行全量同步', async () => {
      writeFileSync(
        CONFIG_PATH,
        JSON.stringify({
          cookie: 'test-cookie',
          projectId: '123',
          dest: TEST_DIR,
          typesFileName: 'types.ts',
          typesExportName: 'IconName',
        }),
        'utf-8',
      );

      const originalCwd = process.cwd;
      process.cwd = () => TEST_DIR;

      await runCommand();

      process.cwd = originalCwd;

      expect(mockIntro).toHaveBeenCalled();
      expect(mockOutro).toHaveBeenCalled();
    });

    it('配置文件不存在时应提示生成', async () => {
      mockConfirm.mockResolvedValue(true);

      const originalCwd = process.cwd;
      process.cwd = () => TEST_DIR;

      await runCommand();

      process.cwd = originalCwd;

      expect(mockConfirm).toHaveBeenCalledWith({
        message: '未找到配置文件，是否生成默认的 .iconfont-sync.json？',
      });
      expect(mockLog.success).toHaveBeenCalled();
    });

    it('用户拒绝时应跳过生成', async () => {
      mockConfirm.mockResolvedValue(false);

      const originalCwd = process.cwd;
      process.cwd = () => TEST_DIR;

      await runCommand();

      process.cwd = originalCwd;

      expect(mockConfirm).toHaveBeenCalled();
      expect(mockLog.success).not.toHaveBeenCalled();
    });

    it('用户取消确认时应终止操作', async () => {
      mockConfirm.mockResolvedValue(Symbol.for('clack.cancel'));
      mockIsCancel.mockReturnValue(true);

      const originalCwd = process.cwd;
      process.cwd = () => TEST_DIR;

      await runCommand();

      process.cwd = originalCwd;

      expect(mockCancel).toHaveBeenCalledWith('操作已取消');
    });
  });
});
