import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { defaultOptions, generateConfig, loadConfig } from '../src/config';

const TEST_DIR = resolve(import.meta.dirname, '__fixtures_config__');
const CONFIG_FILE = resolve(TEST_DIR, '.iconfont-sync.json');

describe('配置模块', () => {
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

  describe('默认配置项', () => {
    it('应包含所有必填字段', () => {
      expect(defaultOptions).toHaveProperty('cookie');
      expect(defaultOptions).toHaveProperty('projectId');
      expect(defaultOptions).toHaveProperty('dest');
      expect(defaultOptions).toHaveProperty('typesFileName');
      expect(defaultOptions).toHaveProperty('typesExportName');
    });

    it('cookie 和 projectId 默认为空字符串', () => {
      expect(defaultOptions.cookie).toBe('');
      expect(defaultOptions.projectId).toBe('');
    });
  });

  describe('生成配置文件', () => {
    it('应使用默认配置项生成配置文件', () => {
      generateConfig(TEST_DIR);

      expect(existsSync(CONFIG_FILE)).toBe(true);

      const content = readFileSync(CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(content);

      expect(parsed.$schema).toBe('node_modules/iconfont-sync/schema.json');
      expect(parsed.cookie).toBe(defaultOptions.cookie);
      expect(parsed.projectId).toBe(defaultOptions.projectId);
    });

    it('应覆盖已存在的配置文件', () => {
      writeFileSync(CONFIG_FILE, JSON.stringify({ cookie: 'old' }), 'utf-8');

      generateConfig(TEST_DIR);

      const content = readFileSync(CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(content);

      expect(parsed.cookie).toBe('');
    });
  });

  describe('加载配置文件', () => {
    it('应加载配置并与默认值合并', () => {
      writeFileSync(
        CONFIG_FILE,
        JSON.stringify({ cookie: 'test-cookie', projectId: '123' }),
        'utf-8',
      );

      const config = loadConfig(CONFIG_FILE);

      expect(config.cookie).toBe('test-cookie');
      expect(config.projectId).toBe('123');
      expect(config.dest).toBe(defaultOptions.dest);
      expect(config.typesFileName).toBe(defaultOptions.typesFileName);
      expect(config.typesExportName).toBe(defaultOptions.typesExportName);
    });

    it('配置文件不存在时应抛出错误', () => {
      if (existsSync(CONFIG_FILE)) {
        rmSync(CONFIG_FILE);
      }

      expect(() => loadConfig(CONFIG_FILE)).toThrow('Config file not found');
    });

    it('配置字段为空时应使用默认值', () => {
      writeFileSync(CONFIG_FILE, JSON.stringify({}), 'utf-8');

      const config = loadConfig(CONFIG_FILE);

      expect(config.cookie).toBe(defaultOptions.cookie);
      expect(config.projectId).toBe(defaultOptions.projectId);
      expect(config.dest).toBe(defaultOptions.dest);
    });
  });
});
