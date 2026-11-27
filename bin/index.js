#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { phpBin } from '../src/platform.js';
import { spawnWatchedPhp } from '../src/index.js';

const WATCHDOG_FLAG = '--spawn-watchdog';
const argv = process.argv.slice(2);

// 看门狗模式:消费标志位后按普通参数启动 php,并监听自身 stdin —— 宿主(dev server)
// 死亡时管道 EOF 由内核保证送达,级联回收 php。须以管道 stdin 启动(spawn 默认 pipe)。
const watchdog = argv[0] === WATCHDOG_FLAG;
const phpArgs = watchdog ? argv.slice(1) : argv;

if (watchdog && process.stdin.isTTY) {
	console.error(`[node-php-x] ${WATCHDOG_FLAG} 需要管道 stdin(TTY 下 EOF 语义不成立),已按普通模式执行`);
}

if (watchdog && !process.stdin.isTTY) {
	spawnWatchedPhp(phpArgs);
} else {
	const child = spawn(phpBin, phpArgs, {
		stdio: 'inherit',
		windowsHide: false,
	});

	child.on('error', (err) => {
		console.error(`无法启动 PHP (${phpBin}): ${err.message}`);
		process.exit(1);
	});

	child.on('exit', (code, signal) => {
		if (signal) {
			process.kill(process.pid, signal);
		} else {
			process.exit(code ?? 1);
		}
	});
}
