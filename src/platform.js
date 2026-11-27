// 按运行平台解析对应的 PHP 二进制子包。
// 平台子包通过 os/cpu 字段由包管理器自动选择安装，这里只做运行时定位。

const PLATFORM_PACKAGES = {
  'win32-x64': '@node-php-x/win32-x64',
};

const key = `${process.platform}-${process.arch}`;
const packageName = PLATFORM_PACKAGES[key];

if (!packageName) {
  throw new Error(
    `node-php-x 暂不支持当前平台 ${key}。支持的平台: ${Object.keys(PLATFORM_PACKAGES).join(', ')}`,
  );
}

let phpBin;
try {
  // 用 import.meta.resolve 定位子包入口，避免静态 import 在未安装时报错
  const entry = import.meta.resolve(packageName);
  ({ phpBin } = await import(entry));
} catch (err) {
  throw new Error(
    `无法加载平台包 ${packageName}，请重新安装 node-php-x。原因: ${err.message}`,
  );
}

export { phpBin, key as platformKey };
