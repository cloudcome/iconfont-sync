import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { objectDefaults } from '@cloudcome/utils-core/object';

/**
 * iconfont-sync 配置选项
 */
export type Options = {
  /**
   * iconfont 网站登录后的 Cookie，用于接口鉴权
   */
  cookie: string;
  /**
   * iconfont 项目 ID
   */
  projectId: string;
  /**
   * 图标文件下载源目录，默认 "./iconfont"
   */
  src?: string;
  /**
   * 图标文件输出目标目录，默认 "./dist-local/iconfont"
   */
  dest?: string;
  /**
   * 生成的 TypeScript 类型文件名，默认 "iconfont.ts"
   */
  typesFileName?: string;
  /**
   * 生成的类型导出名称，默认 "IconName"
   */
  typesExportName?: string;
};

/**
 * 所有字段均为必填的 Options 版本
 * 由 Required<Options> 推导而来，用于内部处理时确保所有字段已填充默认值
 */
export type OptionsStrict = Required<Options>;

/** 配置文件名称 */
const CONFIG_FILE_NAME = '.iconfont-sync.json';

/**
 * 默认配置项
 *
 * 当配置文件中缺失某字段时，以此默认值填充。
 * cookie 和 projectId 默认为空字符串，需用户自行填写。
 */
export const defaultOptions: Options = {
  cookie: '',
  projectId: '',
  dest: './src/assets/iconfont',
  typesFileName: 'iconfont.ts',
  typesExportName: 'IconName',
};

/**
 * 加载并解析 .iconfont-sync.json 配置文件
 *
 * 从指定路径（或当前工作目录）读取 JSON 配置文件，
 * 缺失的字段用 defaultOptions 中的默认值填充。
 *
 * @param configPath - 配置文件路径，不传则默认读取当前目录下的 .iconfont-sync.json
 * @returns 合并后的完整配置对象
 * @throws 当配置文件不存在时抛出错误
 */
export function loadConfig(configPath?: string): OptionsStrict {
  const filePath = configPath || resolve(process.cwd(), CONFIG_FILE_NAME);

  if (!existsSync(filePath)) {
    throw new Error(`Config file not found: ${filePath}`);
  }

  const content = readFileSync(filePath, 'utf-8');
  const config = JSON.parse(content) as Partial<Options>;

  return objectDefaults(config, defaultOptions) as OptionsStrict;
}

/**
 * 生成 .iconfont-sync.json 配置文件
 *
 * 将传入的配置项与默认值合并后，写入指定路径（或当前工作目录）。
 *
 * @param dirname - 配置文件写入目录
 */
export function generateConfig(dirname: string): void {
  const filePath = resolve(dirname, CONFIG_FILE_NAME);
  writeFileSync(
    filePath,
    `${JSON.stringify(defaultOptions, null, 2)}\n`,
    'utf-8',
  );
}
