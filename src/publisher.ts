/**
 * npm 发布逻辑
 */
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";
import type { PublishConfig } from "./types";
import { updateChangelog } from "./utils/changelog";
import { t } from "./i18n";

/**
 * 更新 package.json 中的版本号
 */
function updatePackageVersion(packagePath: string, newVersion: string): void {
  const packageJsonPath = join(packagePath, "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  
  packageJson.version = newVersion;
  
  writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + "\n",
    "utf-8"
  );
}

/**
 * 创建 git tag
 */
async function createGitTag(tag: string): Promise<void> {
  const proc = Bun.spawn(["git", "tag", tag], {
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    throw new Error(t("git.createTagFailed", { exitCode }));
  }
}

/**
 * 推送 git tag
 */
async function pushGitTag(tag: string): Promise<void> {
  const proc = Bun.spawn(["git", "push", "origin", tag], {
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    throw new Error(t("git.pushTagFailed", { exitCode }));
  }
}

/**
 * 检查 npm 登录状态
 */
async function checkNpmAuth(registry: string): Promise<void> {
  const proc = Bun.spawn(
    ["npm", "whoami", "--registry", registry],
    {
      stdout: "pipe",
      stderr: "pipe",
    }
  );

  const exitCode = await proc.exited;
  
  if (exitCode !== 0) {
    // 获取错误输出
    const stderr = await new Response(proc.stderr).text();
    const errorMsg = stderr.trim();
    
    // 检查是否是未登录错误
    if (errorMsg.includes("not logged in") || errorMsg.includes("Unauthorized") || errorMsg === "") {
      throw new Error(t("publish.npmNotLoggedIn", { registry }));
    }
    
    throw new Error(t("publish.npmAuthCheckFailed", { registry, error: errorMsg }));
  }

  // 获取用户名
  const stdout = await new Response(proc.stdout).text();
  const username = stdout.trim();
  
  if (!username) {
    throw new Error(t("publish.npmNotLoggedIn", { registry }));
  }
}

/**
 * 发布到 npm
 */
async function publishToNpm(packagePath: string, registry: string, otp?: string): Promise<void> {
  const args = ["npm", "publish", "--registry", registry];
  
  // 如果提供了 OTP，添加到命令参数中
  if (otp) {
    args.push("--otp", otp);
  }

  const proc = Bun.spawn(args, {
    cwd: packagePath,
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    throw new Error(t("publish.npmPublishFailed", { exitCode }));
  }
}

/**
 * 发布包
 */
export async function publish(config: PublishConfig): Promise<void> {
  // 1. 更新版本号
  updatePackageVersion(config.package.path, config.newVersion);

  // 2. 生成 changelog 文件（如果配置了）
  if (config.generateChangelog) {
    updateChangelog(config.package.path, config.newVersion, config.changelog);
  }

  // 3. 检查 npm 登录状态
  await checkNpmAuth(config.registry);

  // 4. 创建 git tag（如果配置了推送 tag）
  if (config.pushTag) {
    await createGitTag(config.tag);
  }

  // 5. 发布到 npm
  await publishToNpm(config.package.path, config.registry, config.otp);

  // 6. 推送 git tag（如果配置了）
  if (config.pushTag) {
    await pushGitTag(config.tag);
  }
}
