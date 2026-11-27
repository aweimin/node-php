import { fileURLToPath } from 'node:url';
import path from 'node:path';

const packageDir = path.dirname(fileURLToPath(import.meta.url));

// 该子包内 PHP 可执行文件（Windows 为 php.exe）
export const phpBin = path.join(packageDir, 'php', 'php.exe');
