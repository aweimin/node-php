#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { phpBin } from '../src/platform.js';

const child = spawn(phpBin, process.argv.slice(2), {
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
