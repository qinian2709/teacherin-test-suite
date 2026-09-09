import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WORKSPACE_ROOT = path.resolve(ROOT, '..');

const DEFAULT_PROJECT = path.join(WORKSPACE_ROOT, 'teacherin-miniprogram');
const DEFAULT_OUTPUT = path.join(WORKSPACE_ROOT, 'teacherin-miniprogram/dist/build/mp-weixin');

function usage(exitCode = 1): never {
  console.error(`
Usage:
  pnpm prepare:mp
  tsx scripts/prepare-miniprogram.ts --skip-cli-check

Options:
  --skip-cli-check              只检查产物目录，不检查微信开发者工具 CLI
`);
  process.exit(exitCode);
}

function parseArgs(argv: string[]): { skipCliCheck: boolean } {
  const options = { skipCliCheck: false };
  for (const arg of argv) {
    if (arg === '--skip-cli-check') options.skipCliCheck = true;
    else if (arg === '-h' || arg === '--help') usage(0);
    else {
      console.error(`Unknown option: ${arg}`);
      usage();
    }
  }
  return options;
}

function resolveProjectDir(): string {
  return (process.env.MP_PROJECT ?? DEFAULT_OUTPUT).trim() || DEFAULT_OUTPUT;
}

function checkWxCli(): number {
  const cli =
    process.env.WX_DEVTOOLS_CLI?.trim() ||
    '/Applications/wechatwebdevtools.app/Contents/MacOS/cli';
  if (!fs.existsSync(cli)) {
    console.warn(`[prepare:mp] 微信开发者工具 CLI 不存在：${cli}（可用 WX_DEVTOOLS_CLI 覆盖）`);
    return 0;
  }
  const result = spawnSync(cli, ['-h'], { stdio: 'ignore' });
  if (result.error) {
    console.warn(`[prepare:mp] 无法执行微信开发者工具 CLI：${result.error.message}`);
  }
  return 0;
}

function main(): number {
  const options = parseArgs(process.argv.slice(2));
  const projectDir = resolveProjectDir();
  if (!fs.existsSync(projectDir)) {
    console.warn(
      `[prepare:mp] 小程序产物目录不存在：${projectDir}。占位用例会 skip；配置 MP_PROJECT 或编译 ${DEFAULT_PROJECT}`,
    );
    return 0;
  }
  console.log(`[prepare:mp] 使用小程序产物：${projectDir}`);
  if (!options.skipCliCheck) checkWxCli();
  return 0;
}

process.exit(main());
