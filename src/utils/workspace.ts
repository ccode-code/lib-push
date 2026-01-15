/**
 * Workspace 相关工具函数
 */
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";
import type { PackageInfo, WorkspaceInfo } from "../types";
import { t } from "../i18n";

/**
 * 读取 package.json 文件
 */
function readPackageJson(path: string): Record<string, any> | null {
  const packageJsonPath = join(path, "package.json");
  if (!existsSync(packageJsonPath)) {
    return null;
  }
  
  try {
    const content = readFileSync(packageJsonPath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * 检查是否是 monorepo 项目
 */
function isMonorepo(packageJson: Record<string, any>): boolean {
  // 检查是否有 workspaces 字段
  if (packageJson.workspaces && Array.isArray(packageJson.workspaces)) {
    return true;
  }
  
  // 检查是否有 workspaces.packages 字段（pnpm/npm 7+）
  if (packageJson.workspaces?.packages && Array.isArray(packageJson.workspaces.packages)) {
    return true;
  }
  
  return false;
}

/**
 * 解析 workspace 模式
 */
function parseWorkspacePatterns(workspaces: string[] | { packages?: string[] }): string[] {
  if (Array.isArray(workspaces)) {
    return workspaces;
  }
  
  if (workspaces?.packages) {
    return workspaces.packages;
  }
  
  return [];
}

/**
 * 匹配包路径是否满足 workspace 模式
 */
function matchesPattern(path: string, pattern: string): boolean {
  // 简单的 glob 匹配实现
  const regex = pattern
    .replace(/\*\*/g, ".*")
    .replace(/\*/g, "[^/]*")
    .replace(/\//g, "\\/");
  
  return new RegExp(`^${regex}$`).test(path);
}

/**
 * 扫描目录下的包
 */
function scanPackages(
  rootPath: string,
  patterns: string[],
  found: PackageInfo[] = []
): PackageInfo[] {
  const rootPackageJson = readPackageJson(rootPath);
  if (!rootPackageJson) {
    return found;
  }

  // 递归扫描目录
  function scanDirectory(dir: string, depth: number = 0) {
    if (depth > 10) return; // 防止无限递归
    
    try {
      const entries = readdirSync(dir);
      
      for (const entry of entries) {
        const fullPath = join(dir, entry);
        // 计算相对路径，使用 path.relative 确保跨平台兼容
        const relativePath = fullPath.startsWith(rootPath)
          ? fullPath.slice(rootPath.length).replace(/^[/\\]/, "")
          : fullPath;
        
        // 跳过 node_modules 和隐藏目录
        if (entry.startsWith(".") || entry === "node_modules") {
          continue;
        }
        
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          // 检查是否匹配 workspace 模式
          const matches = patterns.some((pattern) => matchesPattern(relativePath, pattern));
          
          if (matches) {
            const packageJson = readPackageJson(fullPath);
            if (packageJson && packageJson.name) {
              found.push({
                name: packageJson.name,
                version: packageJson.version || "0.0.0",
                path: fullPath,
                packageJson,
              });
            }
          } else {
            // 继续递归扫描
            scanDirectory(fullPath, depth + 1);
          }
        }
      }
    } catch (error) {
      // 忽略权限错误等
    }
  }

  scanDirectory(rootPath);
  return found;
}

/**
 * 获取 workspace 信息
 */
export function getWorkspaceInfo(workingDir: string = process.cwd()): WorkspaceInfo {
  const rootPath = resolve(workingDir);
  const rootPackageJson = readPackageJson(rootPath);
  
  if (!rootPackageJson) {
    throw new Error(t("workspace.packageJsonNotFound"));
  }

  const isMonorepoProject = isMonorepo(rootPackageJson);
  
  if (!isMonorepoProject) {
    // 单仓库项目
    return {
      isMonorepo: false,
      packages: [
        {
          name: rootPackageJson.name || "unknown",
          version: rootPackageJson.version || "0.0.0",
          path: rootPath,
          packageJson: rootPackageJson,
        },
      ],
      rootPackageJson,
      rootPath,
    };
  }

  // Monorepo 项目
  const workspaceConfig = rootPackageJson.workspaces;
  const patterns = parseWorkspacePatterns(workspaceConfig);
  
  if (patterns.length === 0) {
    throw new Error(t("workspace.workspacesConfigInvalid"));
  }

  const packages = scanPackages(rootPath, patterns);
  
  // 如果没有找到包，至少包含根包
  if (packages.length === 0 && rootPackageJson.name) {
    packages.push({
      name: rootPackageJson.name,
      version: rootPackageJson.version || "0.0.0",
      path: rootPath,
      packageJson: rootPackageJson,
    });
  }

  return {
    isMonorepo: true,
    packages,
    rootPackageJson,
    rootPath,
  };
}

/**
 * 根据包名查找包信息
 */
export function findPackageByName(
  workspaceInfo: WorkspaceInfo,
  packageName: string
): PackageInfo | undefined {
  return workspaceInfo.packages.find((pkg) => pkg.name === packageName);
}

/**
 * 根据路径查找包信息
 */
export function findPackageByPath(
  workspaceInfo: WorkspaceInfo,
  packagePath: string
): PackageInfo | undefined {
  const resolvedPath = resolve(packagePath);
  return workspaceInfo.packages.find((pkg) => resolve(pkg.path) === resolvedPath);
}
