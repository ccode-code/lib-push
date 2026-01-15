/**
 * Scripts 工具函数测试
 */
import { describe, test, expect } from "bun:test";
import { getPackageScripts } from "./scripts";
import type { PackageInfo } from "../types";

describe("Scripts 工具函数", () => {
  describe("getPackageScripts", () => {
    test("应该返回所有 scripts", () => {
      const packageInfo: PackageInfo = {
        name: "test-package",
        version: "1.0.0",
        path: "/test",
        packageJson: {
          name: "test-package",
          version: "1.0.0",
          scripts: {
            build: "bun build",
            test: "bun test",
            dev: "bun run --watch",
          },
        },
      };

      const scripts = getPackageScripts(packageInfo);

      expect(scripts).toContain("build");
      expect(scripts).toContain("test");
      expect(scripts).toContain("dev");
      expect(scripts.length).toBe(3);
    });

    test("没有 scripts 应该返回空数组", () => {
      const packageInfo: PackageInfo = {
        name: "test-package",
        version: "1.0.0",
        path: "/test",
        packageJson: {
          name: "test-package",
          version: "1.0.0",
        },
      };

      const scripts = getPackageScripts(packageInfo);

      expect(scripts).toEqual([]);
      expect(scripts.length).toBe(0);
    });

    test("scripts 不是对象应该返回空数组", () => {
      const packageInfo: PackageInfo = {
        name: "test-package",
        version: "1.0.0",
        path: "/test",
        packageJson: {
          name: "test-package",
          version: "1.0.0",
          scripts: "invalid",
        },
      };

      const scripts = getPackageScripts(packageInfo);

      expect(scripts).toEqual([]);
    });
  });
});
