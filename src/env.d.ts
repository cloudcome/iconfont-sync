/**
 * 由 vite define 注入的包版本号
 * 构建时从 package.json 的 version 字段读取
 */
declare const PKG_VERSION: string;

/**
 * 由 vite define 注入的测试环境标识
 * 仅在 vitest 运行时为 true
 */
declare const IS_TEST: boolean;
