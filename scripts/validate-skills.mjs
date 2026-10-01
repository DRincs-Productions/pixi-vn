/**
 * Validates every skills/<name>/SKILL.md against the `npx skills` convention
 * (https://www.skills.sh), including the repo's documented install command.
 */

import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const skillsDir = join(rootDir, "skills");

const NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_DESCRIPTION_LENGTH = 1024;
const FRONTMATTER_BOUNDARY_PATTERN = /^---\s*$/;
const CATEGORIES_FILE = join(skillsDir, "categories.json");
const SKILLS_SH_CATEGORIES = new Set([
    "assets",
    "canvas",
    "characters",
    "getting-started",
    "history",
    "migration",
    "minigames",
    "narration",
    "saves",
    "sound",
    "storage",
    "testing",
    "ui",
]);

function parseFrontmatter(content) {
    const lines = content.split(/\r?\n/);
    if (lines[0] !== "---") return null;

    const closingIndex = lines.findIndex(
        (line, index) => index > 0 && FRONTMATTER_BOUNDARY_PATTERN.test(line),
    );
    if (closingIndex === -1) return null;

    const fields = {};
    for (const line of lines.slice(1, closingIndex)) {
        if (!line.trim()) continue;
        const separatorIndex = line.indexOf(":");
        if (separatorIndex === -1) return null;
        const key = line.slice(0, separatorIndex).trim();
        let value = line.slice(separatorIndex + 1).trim();
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }
        if (!key || !value || Object.hasOwn(fields, key)) return null;
        fields[key] = value;
    }
    return fields;
}

async function main() {
    let entries;
    try {
        entries = await readdir(skillsDir, { withFileTypes: true });
    } catch {
        console.error(`No "skills" directory found at ${skillsDir}`);
        process.exitCode = 1;
        return;
    }

    const errors = [];
    const seenNames = new Map();
    let skillCategories;

    try {
        skillCategories = JSON.parse(await readFile(CATEGORIES_FILE, "utf8"));
        if (
            !skillCategories ||
            typeof skillCategories !== "object" ||
            Array.isArray(skillCategories)
        ) {
            throw new Error("expected a JSON object mapping skill names to directory names");
        }
    } catch (error) {
        errors.push(`skills/categories.json is invalid: ${error.message}`);
        skillCategories = {};
    }

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const skillPath = join(skillsDir, entry.name, "SKILL.md");
        let content;
        try {
            content = await readFile(skillPath, "utf8");
        } catch {
            errors.push(`skills/${entry.name}/SKILL.md is missing`);
            continue;
        }

        const fields = parseFrontmatter(content);
        if (!fields) {
            errors.push(`skills/${entry.name}/SKILL.md has no frontmatter block (---...---)`);
            continue;
        }

        if (!fields.name) {
            errors.push(`skills/${entry.name}/SKILL.md: frontmatter is missing "name"`);
        } else if (!NAME_PATTERN.test(fields.name)) {
            errors.push(
                `skills/${entry.name}/SKILL.md: "name: ${fields.name}" must be lowercase kebab-case`,
            );
        } else if (seenNames.has(fields.name)) {
            errors.push(
                `skills/${entry.name}/SKILL.md: "name: ${fields.name}" duplicates skills/${seenNames.get(fields.name)}/SKILL.md`,
            );
        } else {
            seenNames.set(fields.name, entry.name);
            const expectedCategory = skillCategories[fields.name];
            if (!expectedCategory) {
                errors.push(
                    `skills/${entry.name}/SKILL.md: "${fields.name}" is missing from skills/categories.json`,
                );
            } else if (expectedCategory !== entry.name) {
                errors.push(
                    `skills/${entry.name}/SKILL.md: skills/categories.json maps "${fields.name}" to "${expectedCategory}"`,
                );
            }
        }

        if (!fields.description) {
            errors.push(`skills/${entry.name}/SKILL.md: frontmatter is missing "description"`);
        } else if (fields.description.length < 20) {
            errors.push(
                `skills/${entry.name}/SKILL.md: "description" is too short to be useful (${fields.description.length} chars)`,
            );
        } else if (fields.description.length > MAX_DESCRIPTION_LENGTH) {
            errors.push(
                `skills/${entry.name}/SKILL.md: "description" exceeds ${MAX_DESCRIPTION_LENGTH} characters (${fields.description.length} chars)`,
            );
        }

        if (!content.endsWith("\n")) {
            errors.push(`skills/${entry.name}/SKILL.md: file must end with a newline`);
        }

        const bodyStat = await stat(skillPath);
        if (bodyStat.size < 200) {
            errors.push(
                `skills/${entry.name}/SKILL.md looks empty/too short (${bodyStat.size} bytes)`,
            );
        }
    }

    for (const [skillName, category] of Object.entries(skillCategories)) {
        if (!SKILLS_SH_CATEGORIES.has(category)) {
            errors.push(
                `skills/categories.json maps "${skillName}" to unsupported category "${category}"; expected one of: ${[...SKILLS_SH_CATEGORIES].join(", ")}`,
            );
        }
        if (!seenNames.has(skillName)) {
            errors.push(`skills/categories.json lists "${skillName}", but no matching SKILL.md was found`);
        }
    }

    if (seenNames.size === 0) {
        errors.push(`No SKILL.md files found under ${skillsDir}`);
    }

    if (errors.length > 0) {
        console.error(`Found ${errors.length} skill validation error(s):\n`);
        for (const error of errors) {
            console.error(`  - ${error}`);
        }
        process.exitCode = 1;
        return;
    }

    console.log(
        `Validated ${seenNames.size} skill(s) under skills/: ${[...seenNames.keys()].join(", ")}`,
    );
}

await main();
