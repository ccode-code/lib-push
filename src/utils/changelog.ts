/**
 * Changelog 生成工具
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { t } from "../i18n";

/**
 * Changelog 条目类型
 */
export type ChangelogType = "added" | "changed" | "deprecated" | "removed" | "fixed" | "security";

/**
 * Changelog 条目
 */
export interface ChangelogEntry {
  type: ChangelogType;
  description: string;
}

/**
 * 生成 changelog 条目文本
 */
function formatChangelogEntry(entry: ChangelogEntry): string {
  const typeLabels: Record<ChangelogType, string> = {
    added: t("changelogTypes.added"),
    changed: t("changelogTypes.changed"),
    deprecated: t("changelogTypes.deprecated"),
    removed: t("changelogTypes.removed"),
    fixed: t("changelogTypes.fixed"),
    security: t("changelogTypes.security"),
  };

  return `- ${typeLabels[entry.type]}: ${entry.description}`;
}

/**
 * 解析 changelog 文本为条目
 */
export function parseChangelog(changelogText: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  const lines = changelogText.split("\n").filter((line) => line.trim());

  // 支持多语言的类型标签映射
  const typeMaps: Record<string, Record<string, ChangelogType>> = {
    zh: { 新增: "added", 变更: "changed", 废弃: "deprecated", 移除: "removed", 修复: "fixed", 安全: "security" },
    en: { Added: "added", Changed: "changed", Deprecated: "deprecated", Removed: "removed", Fixed: "fixed", Security: "security" },
    ja: { 追加: "added", 変更: "changed", 非推奨: "deprecated", 削除: "removed", 修正: "fixed", セキュリティ: "security" },
    ko: { 추가됨: "added", 변경됨: "changed", 사용중단됨: "deprecated", 제거됨: "removed", 수정됨: "fixed", 보안: "security" },
  };

  // 构建所有语言的匹配模式
  const allTypeLabels: string[] = [];
  for (const langMap of Object.values(typeMaps)) {
    allTypeLabels.push(...Object.keys(langMap));
  }
  const typePattern = allTypeLabels.join("|");

  for (const line of lines) {
    // 匹配格式: - 类型: 描述 或 - Type: description
    const matchWithDash = line.match(new RegExp(`^-\\s*(${typePattern}):\\s*(.+)$`));
    if (matchWithDash) {
      const [, typeLabel, description] = matchWithDash;
      
      // 在所有语言映射中查找
      let type: ChangelogType | undefined;
      for (const langMap of Object.values(typeMaps)) {
        if (typeLabel in langMap) {
          type = langMap[typeLabel];
          break;
        }
      }

      if (type) {
        entries.push({ type, description: description.trim() });
        continue;
      }
    }
    
    // 匹配格式: 类型: 描述（没有 - 前缀）
    const matchWithoutDash = line.match(new RegExp(`^(${typePattern}):\\s*(.+)$`));
    if (matchWithoutDash) {
      const [, typeLabel, description] = matchWithoutDash;
      
      // 在所有语言映射中查找
      let type: ChangelogType | undefined;
      for (const langMap of Object.values(typeMaps)) {
        if (typeLabel in langMap) {
          type = langMap[typeLabel];
          break;
        }
      }

      if (type) {
        entries.push({ type, description: description.trim() });
        continue;
      }
    }
    
    // 简单格式: - 描述（默认为 added）
    if (line.trim().startsWith("-")) {
      const description = line.replace(/^-\s*/, "").trim();
      if (description) {
        entries.push({ type: "added", description });
        continue;
      }
    }
    
    // 简单格式: 描述（没有 - 前缀，默认为 added）
    const trimmedLine = line.trim();
    if (trimmedLine) {
      entries.push({ type: "added", description: trimmedLine });
    }
  }

  return entries;
}

/**
 * 生成 changelog 版本区块
 */
export function generateChangelogSection(
  version: string,
  date: string,
  entries: ChangelogEntry[]
): string {
  const sections: Record<ChangelogType, string[]> = {
    added: [],
    changed: [],
    deprecated: [],
    removed: [],
    fixed: [],
    security: [],
  };

  // 按类型分组
  for (const entry of entries) {
    sections[entry.type].push(formatChangelogEntry(entry));
  }

  const lines: string[] = [];
  lines.push(`## [${version}] - ${date}`);
  lines.push("");

  // 按顺序输出各个类型
  const typeOrder: ChangelogType[] = ["added", "changed", "deprecated", "removed", "fixed", "security"];
  for (const type of typeOrder) {
    if (sections[type].length > 0) {
      const typeLabels: Record<ChangelogType, string> = {
        added: `### ${t("changelogTypes.added")}`,
        changed: `### ${t("changelogTypes.changed")}`,
        deprecated: `### ${t("changelogTypes.deprecated")}`,
        removed: `### ${t("changelogTypes.removed")}`,
        fixed: `### ${t("changelogTypes.fixed")}`,
        security: `### ${t("changelogTypes.security")}`,
      };
      lines.push(typeLabels[type]);
      lines.push("");
      lines.push(...sections[type]);
      lines.push("");
    }
  }

  return lines.join("\n");
}

/**
 * 读取现有的 CHANGELOG.md
 */
export function readChangelog(packagePath: string): string {
  const changelogPath = join(packagePath, "CHANGELOG.md");
  if (!existsSync(changelogPath)) {
    return "";
  }

  try {
    return readFileSync(changelogPath, "utf-8");
  } catch {
    return "";
  }
}

/**
 * 更新 CHANGELOG.md 文件
 */
export function updateChangelog(
  packagePath: string,
  version: string,
  changelogText: string
): void {
  const changelogPath = join(packagePath, "CHANGELOG.md");
  const existingContent = readChangelog(packagePath);

  // 解析用户输入的 changelog
  const entries = parseChangelog(changelogText);
  
  // 生成日期（YYYY-MM-DD 格式）
  const date = new Date().toISOString().split("T")[0];

  // 生成新版本区块
  const newSection = generateChangelogSection(version, date, entries);

  // 构建新的 changelog 内容
  let newContent = "";

  if (existingContent) {
    // 如果已有 changelog，在开头插入新版本
    // 查找第一个版本区块的位置
    const versionMatch = existingContent.match(/^##\s+\[/m);
    if (versionMatch && versionMatch.index !== undefined) {
      // 在第一个版本区块前插入新版本
      newContent =
        existingContent.slice(0, versionMatch.index) +
        newSection +
        "\n\n" +
        existingContent.slice(versionMatch.index);
    } else {
      // 如果没有找到版本区块，直接在前面添加
      newContent = newSection + "\n\n" + existingContent;
    }
  } else {
    // 如果没有现有 changelog，创建新的
    // 根据语言生成不同的头部说明
    const lang = t("common.yes") === "是" ? "zh-CN" : t("common.yes") === "Yes" ? "en" : t("common.yes") === "はい" ? "ja" : "ko";
    const headers: Record<string, string> = {
      "zh-CN": `# Changelog\n\n所有重要的项目变更都会记录在这个文件中。\n\n格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，\n本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。\n\n`,
      en: `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\nand this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n`,
      ja: `# Changelog\n\nこのプロジェクトの重要な変更はすべてこのファイルに記録されます。\n\n形式は [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/) に基づいており、\nこのプロジェクトは [セマンティックバージョニング](https://semver.org/lang/ja/) に準拠しています。\n\n`,
      ko: `# Changelog\n\n이 프로젝트의 모든 중요한 변경 사항은 이 파일에 기록됩니다.\n\n형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 기반으로 하며,\n이 프로젝트는 [시맨틱 버전 관리](https://semver.org/lang/ko/)를 준수합니다.\n\n`,
    };
    newContent = `${headers[lang] || headers.en}${newSection}\n`;
  }

  // 写入文件
  writeFileSync(changelogPath, newContent, "utf-8");
}

/**
 * 从简单文本生成格式化的 changelog 条目
 */
export function formatSimpleChangelog(text: string): ChangelogEntry[] {
  // 如果文本包含类型标记（冒号），尝试解析它
  // parseChangelog 已经支持多语言类型标签
  if (text.includes(":")) {
    const parsed = parseChangelog(text);
    // 如果解析成功（找到了类型标签），返回解析结果
    if (parsed.length > 0 && parsed.some((entry) => entry.type !== "added" || entry.description.includes(":"))) {
      return parsed;
    }
  }

  // 否则，将每行作为一个 added 类型的条目
  const lines = text.split("\n").filter((line) => line.trim());
  return lines.map((line) => ({
    type: "added" as ChangelogType,
    description: line.trim(),
  }));
}
