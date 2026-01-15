/**
 * JS API 测试
 */
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdir, writeFile, rm } from "fs/promises";
import { join } from "path";
import { NpmPush, publishPackage } from "./index";

// 临时测试目录
const TEST_DIR = join(process.cwd(), ".test-tmp-api");

describe("NpmPush API", () => {
  beforeEach(async () => {
    // 清理并创建测试目录
    try {
      await rm(TEST_DIR, { recursive: true, force: true });
    } catch {
      // 忽略错误
    }
    await mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    // 清理测试目录
    try {
      await rm(TEST_DIR, { recursive: true, force: true });
    } catch {
      // 忽略错误
    }
  });

  describe("NpmPush 类", () => {
    test("应该正确初始化", async () => {
      const packageJson = {
        name: "test-package",
        version: "1.0.0",
      };

      await writeFile(
        join(TEST_DIR, "package.json"),
        JSON.stringify(packageJson, null, 2)
      );

      const npmPush = new NpmPush(TEST_DIR);

      expect(npmPush).toBeDefined();
    });

    test("应该获取 workspace 信息", async () => {
      const packageJson = {
        name: "test-package",
        version: "1.0.0",
      };

      await writeFile(
        join(TEST_DIR, "package.json"),
        JSON.stringify(packageJson, null, 2)
      );

      const npmPush = new NpmPush(TEST_DIR);
      const workspaceInfo = npmPush.getWorkspaceInfo();

      expect(workspaceInfo).toBeDefined();
      expect(workspaceInfo.isMonorepo).toBe(false);
    });

    test("应该获取所有包", async () => {
      const packageJson = {
        name: "test-package",
        version: "1.0.0",
      };

      await writeFile(
        join(TEST_DIR, "package.json"),
        JSON.stringify(packageJson, null, 2)
      );

      const npmPush = new NpmPush(TEST_DIR);
      const packages = npmPush.getPackages();

      expect(packages).toBeDefined();
      expect(Array.isArray(packages)).toBe(true);
      expect(packages.length).toBeGreaterThan(0);
    });

    test("应该根据名称查找包", async () => {
      const packageJson = {
        name: "test-package",
        version: "1.0.0",
      };

      await writeFile(
        join(TEST_DIR, "package.json"),
        JSON.stringify(packageJson, null, 2)
      );

      const npmPush = new NpmPush(TEST_DIR);
      const pkg = npmPush.findPackage("test-package");

      expect(pkg).toBeDefined();
      expect(pkg?.name).toBe("test-package");
    });

    test("找不到包应该返回 undefined", async () => {
      const packageJson = {
        name: "test-package",
        version: "1.0.0",
      };

      await writeFile(
        join(TEST_DIR, "package.json"),
        JSON.stringify(packageJson, null, 2)
      );

      const npmPush = new NpmPush(TEST_DIR);
      const pkg = npmPush.findPackage("nonexistent");

      expect(pkg).toBeUndefined();
    });
  });

  describe("publishPackage 函数", () => {
    test("应该是一个函数", () => {
      expect(typeof publishPackage).toBe("function");
    });
  });
});
