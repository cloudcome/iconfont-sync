# 贡献指南

感谢你对 iconfont-sync 的关注！请阅读以下指南了解如何参与开发。

## 环境要求

| 工具    | 版本              |
| ------- | ----------------- |
| Node.js | 24（见 `.nvmrc`） |
| pnpm    | 11                |

推荐使用 [nvm](https://github.com/nvm-sh/nvm) 管理 Node.js 版本：

```bash
nvm use
```

## 开发环境搭建

```bash
# 克隆仓库
git clone https://github.com/cloudcome/iconfont-sync.git
cd iconfont-sync

# 安装依赖
pnpm install

# 运行测试确认环境正常
pnpm test
```

## 项目结构

```
iconfont-sync/
├── bin/index.cjs           # CLI 入口
├── src/
│   ├── index.ts            # 公共导出
│   ├── cli.ts              # CLI 命令逻辑
│   ├── config.ts           # 配置管理
│   ├── const.ts            # 常量
│   ├── download.ts         # 下载模块
│   ├── unzip.ts            # 解压模块
│   └── build.ts            # 类型生成
├── test/                   # 测试文件
├── scripts/                # 辅助脚本
└── vite.config.mts         # 构建配置
```

## 开发命令

```bash
pnpm build            # 生产构建
pnpm test             # 运行测试
pnpm test:coverage    # 测试覆盖率
pnpm lint             # 代码检查 + 类型检查
pnpm lint:fix         # 自动修复代码风格问题
```

## 代码规范

### 格式化

项目使用 [Biome](https://biomejs.dev) 进行代码格式化和 lint，配置见 `.biome.jsonc`。

- 缩进：2 空格
- 引号：单引号
- 行宽：120 字符
- 换行符：LF
- 文件编码：UTF-8

提交前会自动运行 lint-staged 进行格式检查和修复。

### TypeScript

- 目标版本：ES2024
- 模块系统：ESM
- 启用严格模式
- 类型导入使用 `import type`
- Node.js 内置模块使用 `node:` 前缀

### 命名约定

| 类别      | 风格             | 示例               |
| --------- | ---------------- | ------------------ |
| 文件      | kebab-case       | `iconfont-sync.ts` |
| 函数/变量 | camelCase        | `loadConfig`       |
| 类型/接口 | PascalCase       | `OptionsStrict`    |
| 常量      | UPPER_SNAKE_CASE | `CONFIG_FILE_NAME` |

### 注释

- 所有导出函数必须有 JSDoc 注释
- 接口属性使用 `@property` 标注
- 不在代码中添加不必要的行内注释

## 测试规范

- 测试框架：Vitest（全局模式）
- 测试文件：`test/*.test.ts`
- 每个模块对应一个测试文件
- 使用 `vi.hoisted()` + `vi.mock()` 进行依赖 mock
- 临时目录命名：`__fixtures_<模块名>__`
- 使用 `beforeAll`/`afterAll` 管理测试资源

### 运行单个测试

```bash
npx vitest run test/unzip.test.ts
```

## Commit 规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范，通过 commitlint 自动校验。

### 格式

```
<type>(<scope>): <subject>
```

### Type 类型

| type       | 说明                   |
| ---------- | ---------------------- |
| `feat`     | 新功能                 |
| `fix`      | 修复 Bug               |
| `docs`     | 文档更新               |
| `style`    | 代码格式（不影响功能） |
| `refactor` | 重构                   |
| `perf`     | 性能优化               |
| `test`     | 测试相关               |
| `chore`    | 构建/工具链相关        |
| `ci`       | CI 配置相关            |

### 示例

```
feat(unzip): 解压时自动扁平化单层嵌套目录
fix(config): 修复相对路径解析错误
docs: 更新 README 配置说明
```

## Pull Request 流程

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feat/my-feature`
3. 编写代码和测试
4. 确保测试通过：`pnpm test`
5. 确保 lint 通过：`pnpm lint`
6. 提交代码（遵循 Commit 规范）
7. 推送到远程分支
8. 创建 Pull Request

### PR 要求

- 新功能必须有对应的测试用例
- 所有测试必须通过
- 代码风格必须符合项目规范
- Commit 信息必须符合 Conventional Commits

## 发布流程

版本发布由 CI 自动管理：

1. 合并 PR 到主分支
2. CI 自动运行测试和构建
3. lerna-lite 根据 commit 信息自动升级版本号
4. 自动发布到 npm

## 问题反馈

- [GitHub Issues](https://github.com/cloudcome/iconfont-sync/issues)
- 提交 Bug 报告时请提供 Node.js 版本、操作系统和复现步骤
