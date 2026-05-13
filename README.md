# iconfont-sync

[![code-review](https://github.com/cloudcome/iconfont-sync/actions/workflows/code-review.yml/badge.svg)](https://github.com/cloudcome/iconfont-sync/actions/workflows/code-review.yml)
[![dependency-review](https://github.com/cloudcome/iconfont-sync/actions/workflows/dependency-review.yml/badge.svg)](https://github.com/cloudcome/iconfont-sync/actions/workflows/dependency-review.yml)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/4fa1acaeb717469caddfe21a84c50bb2)](https://app.codacy.com/gh/cloudcome/iconfont-sync/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/4fa1acaeb717469caddfe21a84c50bb2)](https://app.codacy.com/gh/cloudcome/iconfont-sync/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)
[![npm version](https://badge.fury.io/js/iconfont-sync.svg)](https://npmjs.com/package/iconfont-sync)

从 [iconfont.cn](https://www.iconfont.cn) 同步图标资源到本地项目，并自动生成 TypeScript 类型定义。

## 特性

- 一键下载 iconfont 项目图标资源（字体文件、CSS、JSON 等）
- 自动解压并扁平化目录结构
- 根据 `iconfont.json` 自动生成 TypeScript 联合类型，享受 IDE 智能提示
- 交互式命令行，支持配置文件持久化 Cookie 和项目 ID

## 安装

```bash
pnpm add -D iconfont-sync
```

## 快速开始

在项目根目录运行：

```bash
npx iconfont-sync
```

首次运行会自动生成 `.iconfont-sync.json` 配置文件，按提示编辑后再次运行即可同步图标。

## 配置文件

`.iconfont-sync.json`：

```json
{
  "$schema": "node_modules/iconfont-sync/schema.json",
  "cookie": "",
  "projectId": "",
}
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `cookie` | `string` | 否 | `""` | iconfont 登录后的 Cookie，留空则运行时交互输入 |
| `projectId` | `string` | 否 | `""` | iconfont 项目 ID，留空则运行时交互输入 |
| `dest` | `string` | 否 | `"src/assets/iconfont"` | 图标资源输出目录 |
| `typesFileName` | `string` | 否 | `"types.ts"` | 生成的类型文件名 |
| `typesExportName` | `string` | 否 | `"IconName"` | 生成的类型导出名称 |

### 获取 Cookie

1. 浏览器登录 [iconfont.cn](https://www.iconfont.cn)
2. 打开开发者工具 → Application → Cookies
3. 复制完整的 Cookie 字符串

### 获取项目 ID

进入 iconfont 项目页面，URL 中 `pid=` 后面的数字即为项目 ID。

## 工作流程

```
加载配置 → 下载 ZIP → 解压到目标目录 → 生成类型文件
```

执行完成后，目标目录结构示例：

```
src/assets/iconfont/
├── iconfont.css
├── iconfont.json
├── iconfont.ttf
├── iconfont.woff
├── iconfont.woff2
└── types.ts        # 自动生成的类型文件
```

生成的类型文件内容：

```ts
/**
 * 此文件由 iconfont-sync@1.0.0 自动生成，请勿手动修改
 */
export type IconName = "home" | "user" | "settings";
```

在代码中使用：

```ts
import type { IconName } from '@/assets/iconfont/iconfont'

const icon: IconName = 'home' // IDE 自动补全
```

## 编程接口

```ts
import { loadConfig, generateConfig, downloadResource, unzip, buildTypes } from 'iconfont-sync'

// 加载配置
const config = loadConfig()

// 下载资源
const zipPath = await downloadResource({
  url: 'https://www.iconfont.cn/api/project/download.zip?pid=123456',
  outputDir: './temp',
  filename: 'iconfont.zip',
  headers: { Cookie: 'xxx' },
})

// 解压
await unzip({ zipPath, outputDir: './src/assets/iconfont' })

// 生成类型
await buildTypes(config)
```

## 许可证

[MIT](LICENSE)
