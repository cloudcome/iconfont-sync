import { existsSync, mkdirSync } from 'node:fs';
import { cp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { uniqueString } from '@cloudcome/utils-core/unique';
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
 * 先解压到临时目录，如果解压结果只有一个文件夹（多了一层嵌套），
 * 则自动扁平化，将该文件夹内的所有文件移动到目标目录。
 * 如果输出目录不存在，会自动创建。
 *
 * @param options - 解压配置选项
 * @returns 解压完成后的输出目录路径
 */
export async function unzip(options: UnzipOptions): Promise<string> {
  const { zipPath, outputDir } = options;

  const tmpDir = join(tmpdir(), `iconfont-sync-${uniqueString()}`);
  mkdirSync(tmpDir, { recursive: true });

  try {
    await extract(zipPath, { dir: tmpDir });

    const entries = await readdir(tmpDir, { withFileTypes: true });
    const sourceDir = entries.length === 1 && entries[0].isDirectory() ? join(tmpDir, entries[0].name) : tmpDir;

    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    await cp(sourceDir, outputDir, { recursive: true });

    return outputDir;
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}
