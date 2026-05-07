# AGENTS.md

`iconfont-sync` — 从 iconfont.cn 同步图标资源并生成 TypeScript 类型定义的 CLI 工具。

## 速查

| 文件 | 职责 |
|------|------|
| `src/cli.ts` | CLI 入口，`runCommand()` 编排完整同步流程 |
| `src/config.ts` | `.iconfont-sync.json` 配置加载/生成，`Options` / `OptionsStrict` |
| `src/download.ts` | HTTP 下载，支持重定向、30s 超时 |
| `src/unzip.ts` | ZIP 解压到临时目录 → 扁平化嵌套 → 复制到目标 → 清理 |
| `src/build.ts` | 读取 `iconfont.json` 生成 `export type Xxx = "a" \| "b"` |
| `src/const.ts` | `VERSION`（构建时从 package.json 注入） |
| `src/index.ts` | 公共导出聚合 |

## 技术栈

Node 24 · TS 6 (ES2024) · ESM · Vite 8 (rolldown) · pnpm 11 · Vitest 4 · Biome 2

## 约定

- **风格**：2 空格缩进、单引号、LF、120 字符行宽、无分号 → 由 Biome + `.editorconfig` 管理
- **导入**：Node 内置模块用 `node:` 前缀，类型导入用 `import type`
- **命名**：文件 kebab-case、函数 camelCase、类型 PascalCase、常量 UPPER_SNAKE_CASE
- **注释**：导出函数必须有 JSDoc，不添加不必要的行内注释
- **测试**：Vitest 全局模式，`vi.hoisted()` + `vi.mock()` mock，fixtures 目录 `__fixtures_<模块名>__`

## 命令

```bash
pnpm test             # 运行测试
pnpm lint             # Biome + tsc 检查
pnpm lint:fix         # 自动修复
pnpm build            # 生产构建
```

## 详见

- [README.md](./README.md) — 用户文档
- [CONTRIBUTING.md](./CONTRIBUTING.md) — 开发规范与贡献流程
