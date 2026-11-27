#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const binDir = path.dirname(fileURLToPath(import.meta.url));
const phpExe = path.resolve(
  binDir,
  '..',
  'php',
  process.platform === 'win32' ? 'php.exe' : 'php',
);

const child = spawn(phpExe, process.argv.slice(2), {
  stdio: 'inherit',
  windowsHide: false,
});

child.on('error', (err) => {
  console.error(`无法启动 PHP (${phpExe}): ${err.message}`);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 1);
  }
});
