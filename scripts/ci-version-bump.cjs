const { execSync } = require('node:child_process');
const pkg = require('../package.json');

const firstVersion = process.argv.slice(2)[0] === '--first-version=YES';
const bump = firstVersion ? `${pkg.version}` : '';

// https://github.com/lerna/lerna/tree/main/libs/commands/version
run(`npx lerna version ${bump} --yes`);

/**
 * @param {string} command
 */
function run(command) {
  console.log('>', command);
  execSync(command, { stdio: 'inherit' });
}
