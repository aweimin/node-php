import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const srcDir = path.dirname(fileURLToPath(import.meta.url));
const phpBin = path.resolve(
  srcDir,
  '..',
  'php',
  process.platform === 'win32' ? 'php.exe' : 'php',
);

/**
 * 执行一条 PHP 命令，返回结构化结果。
 *
 * @param {...(string|string[])} args 传给 php 的参数，可传字符串或数组，例如
 *   php('-v')、php('-r', 'echo 1;')、php(['-S', '127.0.0.1:8080'])
 * @returns {{stdout: string, stderr: string, status: number|null}}
 */
export function php(...args) {
  const result = spawnSync(phpBin, args.flat(), { encoding: 'utf8' });

  if (result.error) throw result.error;

  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    status: result.status,
  };
}

/**
 * 获取内置 PHP 的版本信息。
 *
 * @returns {string} 例如 "PHP 8.3.14 (cli) (built: ...) (ZTS ...)"
 */
export function version() {
  const { stdout, stderr, status } = php('-v');

  if (status !== 0) {
    throw new Error(stderr.trim() || `php -v 退出失败，退出码 ${status}`);
  }

  return stdout.trim();
}
