import { spawn, spawnSync } from 'node:child_process';
import { phpBin } from './platform.js';

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

/**
 * 看门狗模式启动常驻 PHP 进程(内置 server 等长驻场景)。
 * 监听宿主 stdin:宿主(dev server 等)死亡时管道写端由内核关闭,收到 EOF
 * 立即 SIGKILL php,不依赖 Windows console 事件送达。须以管道 stdin 启动
 * (spawn 默认 pipe);TTY 下 EOF 语义不成立,由 bin 入口拦截提示。
 *
 * @param {...(string|string[])} args 传给 php 的参数
 * @returns {import('node:child_process').ChildProcess}
 */
export function spawnWatchedPhp(...args) {
	const child = spawn(phpBin, args.flat(), {
		stdio: ['ignore', 'inherit', 'inherit'],
		windowsHide: false,
	});

	let cleanedUp = false;
	const killChild = () => {
		if (cleanedUp) return;
		cleanedUp = true;
		child.kill('SIGKILL'); // Windows 上任意信号等价 TerminateProcess
	};
	// 须 resume 消费流,'end' 才会触发
	process.stdin.on('end', killChild);
	process.stdin.on('close', killChild);
	process.stdin.on('error', killChild);
	process.stdin.resume();

	child.on('exit', (code, signal) => {
		if (signal) {
			process.kill(process.pid, signal);
		} else {
			process.exit(code ?? 1); // php 退出 → 本进程随之退出,防空转
		}
	});

	return child;
}
