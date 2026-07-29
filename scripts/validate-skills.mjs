/**
 * Validates every skills/<name>/SKILL.md against the `npx skills` convention
 * (https://www.skills.sh) before a release goes out, so a malformed skill
 * never ships in a tagged release that `npx skills add DRincs-Productions/pixi-vn`
 * would pull from.
 */

import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const skillsDir = join(rootDir, "skills");

const NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function parseFrontmatter(content) {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return null;

    const fields = {};
    for (const line of match[1].split(/\r?\n/)) {
        if (!line.trim()) continue;
        const separatorIndex = line.indexOf(":");
        if (separatorIndex === -1) continue;
        const key = line.slice(0, separatorIndex).trim();
        let value = line.slice(separatorIndex + 1).trim();
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }
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
        }

        if (!fields.description) {
            errors.push(`skills/${entry.name}/SKILL.md: frontmatter is missing "description"`);
        } else if (fields.description.length < 20) {
            errors.push(
                `skills/${entry.name}/SKILL.md: "description" is too short to be useful (${fields.description.length} chars)`,
            );
        }

        const bodyStat = await stat(skillPath);
        if (bodyStat.size < 200) {
            errors.push(`skills/${entry.name}/SKILL.md looks empty/too short (${bodyStat.size} bytes)`);
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

    console.log(`Validated ${seenNames.size} skill(s) under skills/: ${[...seenNames.keys()].join(", ")}`);
}

await main();
