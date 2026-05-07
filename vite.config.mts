/**
 * @file vite.config.mts
 * @ref https://vitejs.dev/
 */
import dts from "vite-plugin-dts";
import { externalizeDeps } from "vite-plugin-externalize-deps";
import { defineConfig } from "vitest/config";

import pkg from "./package.json";

export default defineConfig((env) => {
  const isTest = env.mode === "test";

  return {
    resolve: {
      tsconfigPaths: true,
    },
    define: {
      PKG_VERSION: JSON.stringify(isTest ? "pkg-version-for-test" : pkg.version),
      IS_TEST: JSON.stringify(isTest),
    },
    build: {
      target: "ES2024",
      minify: false,
      sourcemap: true,
      copyPublicDir: false,
      reportCompressedSize: false,
      lib: {
        entry: {
          index: "src/index.ts",
        },
      },
      rolldownOptions: {
        output: [
          {
            format: "esm",
            entryFileNames: "[name].mjs",
            chunkFileNames: "[name].mjs",
          },
          {
            format: "cjs",
            entryFileNames: "[name].cjs",
            chunkFileNames: "[name].cjs",
          },
        ],
      },
    },
    test: {
      globals: true,
      environment: "node",
      coverage: {
        all: true,
        include: ["src/**/*.ts"],
        reporter: ["lcov", "text"],
      },
    },
    plugins: [
      externalizeDeps({
        deps: true,
        devDeps: true,
        peerDeps: true,
        optionalDeps: true,
        nodeBuiltins: true,
      }),
      dts({
        include: "src",
      }),
    ],
  };
});
