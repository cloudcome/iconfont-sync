import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildTypes } from '../src/build';

const TEST_DIR = resolve(import.meta.dirname, '__fixtures_build__');

describe('类型生成', () => {
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

  it('应根据 iconfont.json 生成类型文件', async () => {
    const iconfontData = {
      id: '123',
      name: 'test',
      font_family: 'iconfont',
      css_prefix_text: 'icon-',
      description: '',
      glyphs: [
        {
          icon_id: '1',
          name: 'home',
          font_class: 'home',
          unicode: 'e001',
          unicode_decimal: 57345,
        },
        {
          icon_id: '2',
          name: 'user',
          font_class: 'user',
          unicode: 'e002',
          unicode_decimal: 57346,
        },
        {
          icon_id: '3',
          name: 'settings',
          font_class: 'settings',
          unicode: 'e003',
          unicode_decimal: 57347,
        },
      ],
    };

    writeFileSync(
      resolve(TEST_DIR, 'iconfont.json'),
      JSON.stringify(iconfontData),
      'utf-8',
    );

    await buildTypes({
      cookie: 'test',
      projectId: '123',
      src: './iconfont',
      dest: TEST_DIR,
      typesFileName: 'iconfont.ts',
      typesExportName: 'IconName',
    });

    const typesPath = resolve(TEST_DIR, 'iconfont.ts');
    expect(existsSync(typesPath)).toBe(true);

    const content = readFileSync(typesPath, 'utf-8');
    expect(content).toBe(
      '/**\n * 此文件由 iconfont-sync@pkg-version-for-test 自动生成，请勿手动修改\n */\nexport type IconName = "home" | "user" | "settings";\n',
    );
  });

  it('应正确处理单个图标', async () => {
    const iconfontData = {
      id: '456',
      name: 'single',
      font_family: 'iconfont',
      css_prefix_text: 'icon-',
      description: '',
      glyphs: [
        {
          icon_id: '1',
          name: 'only',
          font_class: 'only',
          unicode: 'e001',
          unicode_decimal: 57345,
        },
      ],
    };

    writeFileSync(
      resolve(TEST_DIR, 'iconfont.json'),
      JSON.stringify(iconfontData),
      'utf-8',
    );

    await buildTypes({
      cookie: 'test',
      projectId: '456',
      src: './iconfont',
      dest: TEST_DIR,
      typesFileName: 'icons.ts',
      typesExportName: 'MyIcons',
    });

    const content = readFileSync(resolve(TEST_DIR, 'icons.ts'), 'utf-8');
    expect(content).toBe(
      '/**\n * 此文件由 iconfont-sync@pkg-version-for-test 自动生成，请勿手动修改\n */\nexport type MyIcons = "only";\n',
    );
  });

  it('应正确处理空图标列表', async () => {
    const iconfontData = {
      id: '789',
      name: 'empty',
      font_family: 'iconfont',
      css_prefix_text: 'icon-',
      description: '',
      glyphs: [],
    };

    writeFileSync(
      resolve(TEST_DIR, 'iconfont.json'),
      JSON.stringify(iconfontData),
      'utf-8',
    );

    await buildTypes({
      cookie: 'test',
      projectId: '789',
      src: './iconfont',
      dest: TEST_DIR,
      typesFileName: 'iconfont.ts',
      typesExportName: 'IconName',
    });

    const content = readFileSync(resolve(TEST_DIR, 'iconfont.ts'), 'utf-8');
    expect(content).toBe(
      '/**\n * 此文件由 iconfont-sync@pkg-version-for-test 自动生成，请勿手动修改\n */\nexport type IconName = never;\n',
    );
  });

  it('iconfont.json 缺失时应抛出错误', async () => {
    const jsonPath = resolve(TEST_DIR, 'iconfont.json');
    if (existsSync(jsonPath)) {
      rmSync(jsonPath);
    }

    await expect(
      buildTypes({
        cookie: 'test',
        projectId: '999',
        src: './iconfont',
        dest: TEST_DIR,
        typesFileName: 'iconfont.ts',
        typesExportName: 'IconName',
      }),
    ).rejects.toThrow('iconfont.json not found');
  });
});
