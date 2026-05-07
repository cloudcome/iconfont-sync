import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { PassThrough } from 'node:stream';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const { mockGet, mockRequest } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockRequest: {
    on: vi.fn().mockReturnThis(),
    setTimeout: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  },
}));

vi.mock('node:http', () => ({
  default: {
    get: mockGet,
  },
}));

vi.mock('node:https', () => ({
  default: {
    get: mockGet,
  },
}));

import { batchDownload, downloadResource } from '../src/download';

const TEST_DIR = resolve(import.meta.dirname, '__fixtures_download__');

function createMockResponse(
  statusCode: number,
  headers?: Record<string, string>,
) {
  const stream = new PassThrough();
  return {
    statusCode,
    headers: headers || {},
    pipe: (dest: NodeJS.WritableStream) => {
      stream.pipe(dest);
      stream.end();
      return dest;
    },
  };
}

describe('下载模块', () => {
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

  describe('单文件下载', () => {
    it('应成功下载文件', async () => {
      const mockResponse = createMockResponse(200);

      mockGet.mockImplementation(
        (
          _url: string,
          _opts: unknown,
          callback: (res: typeof mockResponse) => void,
        ) => {
          callback(mockResponse);
          return mockRequest;
        },
      );

      const result = await downloadResource({
        url: 'https://example.com/file.zip',
        outputDir: TEST_DIR,
        filename: 'test.zip',
      });

      expect(result).toBe(resolve(TEST_DIR, 'test.zip'));
      expect(existsSync(result)).toBe(true);
    });

    it('应正确处理 301 重定向', async () => {
      const redirectResponse = {
        statusCode: 301,
        headers: { location: 'https://example.com/redirected.zip' },
      };

      const finalResponse = createMockResponse(200);

      let callCount = 0;
      mockGet.mockImplementation(
        (_url: string, _opts: unknown, callback: (res: unknown) => void) => {
          callCount++;
          if (callCount === 1) {
            callback(redirectResponse);
          } else {
            callback(finalResponse);
          }
          return mockRequest;
        },
      );

      const result = await downloadResource({
        url: 'https://example.com/file.zip',
        outputDir: TEST_DIR,
        filename: 'test.zip',
      });

      expect(result).toBe(resolve(TEST_DIR, 'test.zip'));
    });

    it('非 200 状态码时应拒绝', async () => {
      const mockResponse = {
        statusCode: 404,
      };

      mockGet.mockImplementation(
        (
          _url: string,
          _opts: unknown,
          callback: (res: typeof mockResponse) => void,
        ) => {
          callback(mockResponse);
          return mockRequest;
        },
      );

      await expect(
        downloadResource({
          url: 'https://example.com/file.zip',
          outputDir: TEST_DIR,
          filename: 'test.zip',
        }),
      ).rejects.toThrow('下载失败，状态码: 404');
    });

    it('请求出错时应拒绝', async () => {
      mockGet.mockImplementation(() => {
        const req = {
          on: vi.fn((event: string, cb: (err: Error) => void) => {
            if (event === 'error') {
              setTimeout(() => cb(new Error('Network error')), 0);
            }
            return req;
          }),
          setTimeout: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        };
        return req;
      });

      await expect(
        downloadResource({
          url: 'https://example.com/file.zip',
          outputDir: TEST_DIR,
          filename: 'test.zip',
        }),
      ).rejects.toThrow('请求失败: Network error');
    });

    it('下载超时应拒绝', async () => {
      mockGet.mockImplementation(() => {
        const req = {
          on: vi.fn().mockReturnThis(),
          setTimeout: vi.fn((_timeout: number, cb: () => void) => {
            setTimeout(() => cb(), 0);
            return req;
          }),
          destroy: vi.fn(),
        };
        return req;
      });

      await expect(
        downloadResource({
          url: 'https://example.com/file.zip',
          outputDir: TEST_DIR,
          filename: 'test.zip',
        }),
      ).rejects.toThrow('下载超时');
    });

    it('输出目录不存在时应自动创建', async () => {
      const nestedDir = resolve(TEST_DIR, 'nested', 'downloads');

      const mockResponse = createMockResponse(200);

      mockGet.mockImplementation(
        (
          _url: string,
          _opts: unknown,
          callback: (res: typeof mockResponse) => void,
        ) => {
          callback(mockResponse);
          return mockRequest;
        },
      );

      await downloadResource({
        url: 'https://example.com/file.zip',
        outputDir: nestedDir,
        filename: 'test.zip',
      });

      expect(existsSync(nestedDir)).toBe(true);
    });
  });

  describe('批量下载', () => {
    it('应成功下载多个文件', async () => {
      const mockResponse = createMockResponse(200);

      mockGet.mockImplementation(
        (
          _url: string,
          _opts: unknown,
          callback: (res: typeof mockResponse) => void,
        ) => {
          callback(mockResponse);
          return mockRequest;
        },
      );

      const results = await batchDownload(
        ['https://example.com/a.zip', 'https://example.com/b.zip'],
        TEST_DIR,
      );

      expect(results).toHaveLength(2);
    });
  });
});
