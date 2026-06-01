import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { OptionsStrict } from './config';
import { VERSION } from './const';

/**
 * iconfont 项目 JSON 的数据结构
 *
 * @property id - iconfont 项目 ID
 * @property name - 项目名称
 * @property font_family - CSS 字体名称
 * @property css_prefix_text - CSS 类名前缀
 * @property description - 项目描述
 * @property glyphs - 图标列表
 */
interface IconfontJSON {
  id: string;
  name: string;
  font_family: string;
  css_prefix_text: string;
  description: string;
  glyphs: Array<{
    icon_id: string;
    name: string;
    font_class: string;
    unicode: string;
    unicode_decimal: number;
  }>;
}

/**
 * 根据 iconfont.json 生成 TypeScript 类型文件
 *
 * 读取 dest 目录下的 iconfont.json，提取所有图标的 font_class 和 name，
 * 生成 `as const` 对象（每个 key 带 JSDoc 图标名称）及派生联合类型。
 *
 * @param options - 必填配置项，需包含 dest、typesFileName、typesExportName
 */
export async function buildTypes(options: OptionsStrict) {
  const { dest, typesFileName, typesExportName } = options;

  const jsonPath = resolve(dest, 'iconfont.json');

  if (!existsSync(jsonPath)) {
    throw new Error('iconfont.json not found');
  }

  const jsonContent = await readFile(jsonPath, 'utf-8');
  const iconfontData: IconfontJSON = JSON.parse(jsonContent);

  const glyphs = iconfontData.glyphs;
  let iconObjectContent: string;

  if (glyphs.length > 0) {
    const entries = glyphs.map((g) => `  /** ${g.name} */\n  ${g.font_class}: '${g.font_class}',`).join('\n');
    iconObjectContent = [
      'export const Icons = {',
      entries,
      '} as const;',
      '',
      `export type ${typesExportName} = (typeof Icons)[keyof typeof Icons];`,
    ].join('\n');
  } else {
    iconObjectContent = ['export const Icons = {} as const;', '', `export type ${typesExportName} = never;`].join('\n');
  }

  const typeContent = [
    '/**',
    ` * 此文件由 iconfont-sync@${VERSION} 自动生成，请勿手动修改`,
    ' */',
    iconObjectContent,
    '',
  ].join('\n');

  const typesPath = resolve(dest, typesFileName);
  await writeFile(typesPath, typeContent, 'utf-8');
}
