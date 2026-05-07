import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import extract from 'extract-zip';

/**
 * 解压选项配置接口
 */
interface UnzipOptions {
  /**
   * 要解压的 zip 文件路径
   */
  zipPath: string;
  /**
   * 解压输出目录路径
   */
  outputDir: string;
}

/**
 * 解压 zip 文件到指定目录
 *
 * 如果输出目录不存在，会自动创建。
 *
 * @param options - 解压配置选项
 * @returns 解压完成后的输出目录路径
 */
export async function unzip(options: UnzipOptions): Promise<string> {
  const { zipPath, outputDir } = options;

  const resolvedOutputDir = resolve(outputDir);

  if (!existsSync(resolvedOutputDir)) {
    mkdirSync(resolvedOutputDir, { recursive: true });
  }

  await extract(zipPath, { dir: resolvedOutputDir });

  return resolvedOutputDir;
}
