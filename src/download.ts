import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';

/**
 * 下载选项配置接口
 */
interface DownloadOptions {
  /**
   * 要下载的资源的 URL 地址
   */
  url: string;

  /**
   * 文件保存的输出目录路径
   */
  outputDir: string;

  /**
   * 自定义文件名，如果不提供则使用 URL 中的原始文件名
   */
  filename: string;

  /**
   * 可选的 HTTP 请求头，用于设置自定义请求头如认证信息等
   */
  headers?: Record<string, string>;
}

/**
 * 下载原创资源到指定目录
 * @param options 下载配置选项
 * @returns 下载后的文件路径
 */
export async function downloadResource(
  options: DownloadOptions,
): Promise<string> {
  const { url, outputDir, filename, headers = {} } = options;

  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, filename);

  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;

    const request = client.get(url, { headers }, (response) => {
      // 处理重定向
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadResource({ ...options, url: redirectUrl })
            .then(resolve)
            .catch(reject);
          return;
        }
      }

      // 检查响应状态
      if (response.statusCode !== 200) {
        reject(new Error(`下载失败，状态码: ${response.statusCode}`));
        return;
      }

      // 创建写入流
      const fileStream = fs.createWriteStream(filePath);

      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✅ 下载完成: ${filePath}`);
        resolve(filePath);
      });

      fileStream.on('error', (err) => {
        fs.unlink(filePath, () => {}); // 清理失败的文件
        reject(err);
      });
    });

    request.on('error', (err) => {
      reject(new Error(`请求失败: ${err.message}`));
    });

    // 设置超时
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('下载超时'));
    });
  });
}

/**
 * 批量下载多个资源
 * @param urls URL 列表
 * @param outputDir 输出目录
 * @returns 下载成功的文件路径列表
 */
export async function batchDownload(
  urls: string[],
  outputDir: string,
): Promise<string[]> {
  const results: string[] = [];

  for (let i = 0; i < urls.length; i++) {
    try {
      const filePath = await downloadResource({
        url: urls[i],
        outputDir,
        filename: `resource_${i + 1}_${Date.now()}${path.extname(new URL(urls[i]).pathname) || ''}`,
      });
      results.push(filePath);
    } catch (error) {
      console.error(`❌ 下载失败 [${urls[i]}]:`, error);
    }
  }

  return results;
}
