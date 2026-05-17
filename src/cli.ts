import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { cancel, confirm, intro, isCancel, log, outro, spinner, text } from '@clack/prompts';
import { uniqueString } from '@cloudcome/utils-core/unique';
import { buildTypes } from './build';
import { generateConfig, loadConfig } from './config';
import { VERSION } from './const';
import { downloadResource } from './download';
import { unzip } from './unzip';

const ICONFONT_DOWNLOAD_URL = 'https://www.iconfont.cn/api/project/download.zip';

/**
 * 生成默认配置文件
 */
async function handleGenerateConfig(): Promise<void> {
  const cwd = process.cwd();

  if (existsSync(resolve(cwd, '.iconfont-sync.json'))) {
    log.warn('.iconfont-sync.json 已存在，跳过生成');
    return;
  }

  generateConfig(cwd);
  log.success(`已生成配置文件: ${resolve(cwd, '.iconfont-sync.json')}`);
}

/**
 * 完整同步操作
 */
async function handleFullSync(): Promise<void> {
  const cwd = process.cwd();
  const configPath = resolve(cwd, '.iconfont-sync.json');

  if (!existsSync(configPath)) {
    log.warn('未找到 .iconfont-sync.json 配置文件');
    generateConfig(cwd);
    log.success(`已生成默认配置文件: ${configPath}`);
    log.step('请编辑配置文件后重新运行');
    return;
  }

  const config = loadConfig();

  const { src, dest, typesFileName, typesExportName } = config;

  const cookie =
    config.cookie ||
    (await text({
      message: '请输入 iconfont 登录 Cookie',
      validate(value) {
        if (!value) return 'Cookie 不能为空';
      },
    }));

  if (isCancel(cookie)) {
    cancel('操作已取消');
    return;
  }

  const projectId =
    config.projectId ||
    (await text({
      message: '请输入 iconfont 项目 ID',
      validate(value) {
        if (!value) return '项目 ID 不能为空';
      },
    }));

  if (isCancel(projectId)) {
    cancel('操作已取消');
    return;
  }

  const downloadUrl = `${ICONFONT_DOWNLOAD_URL}?pid=${projectId}`;
  const zipFilename = `iconfont-${projectId}.zip`;

  const s = spinner();

  s.start('正在下载图标资源');
  const tempDir = join(tmpdir(), `iconfont-sync-${uniqueString()}`);
  const zipPath = await downloadResource({
    url: downloadUrl,
    outputDir: tempDir,
    filename: zipFilename,
    headers: { Cookie: cookie },
  });
  s.stop('下载完成');

  s.start('正在解压文件');
  await unzip({ zipPath, outputDir: dest });
  s.stop('解压完成');

  s.start('正在生成类型文件');
  await buildTypes({
    cookie,
    projectId,
    src,
    dest,
    typesFileName,
    typesExportName,
  });
  s.stop('类型文件生成完成');

  log.success(`全部完成！图标已同步至: ${resolve(dest)}`);
}

/**
 * 运行命令行工具
 */
export async function runCommand(): Promise<void> {
  intro(`iconfont-sync@${VERSION}`);

  const cwd = process.cwd();
  const configPath = resolve(cwd, '.iconfont-sync.json');

  if (existsSync(configPath)) {
    await handleFullSync();
  } else {
    const shouldGenerate = await confirm({
      message: '未找到配置文件，是否生成默认的 .iconfont-sync.json？',
    });

    if (isCancel(shouldGenerate)) {
      cancel('操作已取消');
      return;
    }

    if (shouldGenerate) {
      await handleGenerateConfig();
    }
  }

  outro('感谢使用 iconfont-sync');
}
