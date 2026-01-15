/**
 * Scripts 相关工具函数
 */
import type { PackageInfo } from "../types";
import { t } from "../i18n";

/**
 * 获取包的所有 scripts
 */
export function getPackageScripts(packageInfo: PackageInfo): string[] {
  const scripts = packageInfo.packageJson.scripts;
  if (!scripts || typeof scripts !== "object") {
    return [];
  }

  return Object.keys(scripts);
}

/**
 * 执行脚本
 */
export async function runScript(
  packageInfo: PackageInfo,
  scriptName: string
): Promise<void> {
  const scripts = packageInfo.packageJson.scripts;
  if (!scripts || !scripts[scriptName]) {
    throw new Error(t("script.notFoundWithName", { name: scriptName }));
  }

  // 使用 Bun 执行脚本
  const proc = Bun.spawn(["bun", "run", scriptName], {
    cwd: packageInfo.path,
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    throw new Error(t("script.executionFailed", { exitCode }));
  }
}
