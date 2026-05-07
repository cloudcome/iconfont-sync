import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { OptionsStrict } from './config';

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
 * 读取 dest 目录下的 iconfont.json，提取所有图标的 font_class，
 * 生成形如 `export type IconName = "icon1" | "icon2"` 的联合类型文件。
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

  const iconNames = iconfontData.glyphs.map((g) => g.font_class);
  const unionType =
    iconNames.length > 0 ? iconNames.map((n) => `"${n}"`).join(' | ') : 'never';
  const typeContent = `export type ${typesExportName} = ${unionType};\n`;

  const typesPath = resolve(dest, typesFileName);
  await writeFile(typesPath, typeContent, 'utf-8');
}
