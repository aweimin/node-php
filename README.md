# node-php-x

将 PHP 解释器打包进 npm 包，安装后即可在任意目录直接运行 `php` 命令，无需单独配置 PHP 环境变量。

## 安装

全局安装，获得全局 `php` 命令：

```bash
npm install -g node-php-x
```

本地开发时也可以在项目内链接：

```bash
npm link
```

## 使用

安装后和普通的 PHP CLI 完全一样，所有参数都会原样转发给内置的 PHP：

```bash
php -v                          # 查看版本
php -S 127.0.0.1:8080           # 启动内置开发服务器
php index.php                   # 执行脚本
php -m                          # 查看已加载扩展
```

命令的退出码也会透传，可用于脚本判断执行结果。

### 看门狗模式（常驻进程随宿主退出）

PHP 内置 server 等常驻进程，在宿主（如 dev server）被强制终止时可能残留。用 `--spawn-watchdog` 启动可让 PHP 跟随宿主退出：

```bash
php --spawn-watchdog -S 127.0.0.1:8080
```

原理：宿主以管道 stdin 启动该进程，PHP 随 stdin 关闭（宿主死亡时由内核保证送达 EOF）而被回收。因此**必须以管道 stdin 启动**；在 TTY 下该标志会提示并回退为普通模式。ESM API 中对应导出 `spawnWatchedPhp()`。

## 版本命名

包版本采用 `PHP主版本.PHP次版本.补丁版本` 格式，便于按 PHP 版本区分：

- `8.3.6` → 基于 PHP 8.3，本库第 6 个补丁版本（当前版本，`latest` 标签）
- 后续切换到 PHP 8.1 / 8.5 / 8.6 时，包版本相应变为 `8.1.x` / `8.5.x` / `8.6.x`

内置的精确 PHP 版本记录在 `package.json` 的 `phpVersion` 字段（当前为 8.3.37），也可通过 `version()` 函数获取。

## 平台支持

PHP 二进制按平台拆分为独立的子包，安装主包时包管理器会根据 `os` / `cpu` 自动只下载匹配的那个：

| 平台 | 子包 |
|---|---|
| Windows x64 | `@node-php-x/win32-x64` |

主包本身只有几 KB 的 JS 入口。目前仅支持 Windows x64，其他平台（Linux / macOS）的子包待补充。

## 说明

- 内置 PHP 8.3.37（Windows x64，ZTS）。
- 当前 `php` 命令名为全局映射，如果系统已安装其他 PHP 且在 PATH 中，可能发生冲突；如需使用其他命令名，可修改 `package.json` 中的 `bin` 字段。
