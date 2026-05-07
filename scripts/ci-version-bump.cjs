const { execSync } = require('node:child_process');
const pkg = require('../package.json');

/**
 * 允许的版本号更新类型
 */
const allowChoices = ['自动递增', '首个版本', '跳过版本'];

/**
 * 主函数
 */
function main() {
  const versionType = process.argv.slice(2)[0];
  if (!allowChoices.includes(versionType)) {
    throw new Error(`版本号更新类型 ${versionType} 不允许`);
  }

  if (versionType === '跳过版本') {
    console.warn('跳过版本号更新');
    return;
  }

  const bump = versionType === '首个版本' ? `${pkg.version}` : '';

  // https://github.com/lerna/lerna/tree/main/libs/commands/version
  run(`npx lerna version ${bump} --yes`);
}

/**
 * @param {string} command
 */
function run(command) {
  console.log('>', command);
  execSync(command, { stdio: 'inherit' });
}

main();
