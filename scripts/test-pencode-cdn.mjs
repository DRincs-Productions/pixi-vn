import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { delimiter, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

function findBrowser() {
    if (process.env.CHROME_BIN && existsSync(process.env.CHROME_BIN)) {
        return process.env.CHROME_BIN;
    }

    const executableNames =
        process.platform === "win32"
            ? ["chrome.exe"]
            : ["chromium", "chromium-browser", "google-chrome", "chrome"];
    for (const directory of (process.env.PATH || "").split(delimiter)) {
        for (const name of executableNames) {
            const candidate = join(directory, name);
            if (existsSync(candidate)) return candidate;
        }
    }

    const playwrightCache = join(homedir(), ".cache", "ms-playwright");
    if (existsSync(playwrightCache)) {
        const revisions = readdirSync(playwrightCache)
            .filter((name) => name.startsWith("chromium-"))
            .sort()
            .reverse();
        for (const revision of revisions) {
            for (const relativePath of [
                "chrome-linux64/chrome",
                "chrome-linux/chrome",
                "chrome-win/chrome.exe",
            ]) {
                const candidate = join(playwrightCache, revision, relativePath);
                if (existsSync(candidate)) return candidate;
            }
        }
    }

    throw new Error("Chrome/Chromium not found. Set CHROME_BIN to its executable path.");
}

const fixture = fileURLToPath(new URL("../tests/pencode-jsdelivr.html", import.meta.url));
const version = process.env.PIXIVN_CDN_VERSION || "latest";
const fixtureUrl = new URL(pathToFileURL(fixture));
fixtureUrl.searchParams.set("version", version);

const browser = findBrowser();
const result = spawnSync(
    browser,
    [
        "--headless",
        "--no-sandbox",
        "--disable-gpu",
        "--dump-dom",
        "--virtual-time-budget=45000",
        fixtureUrl.href,
    ],
    { encoding: "utf8", timeout: 90_000 },
);

if (result.error) throw result.error;
if (result.status !== 0) {
    process.stderr.write(result.stderr);
    throw new Error(`Chrome exited with status ${result.status}`);
}

if (!result.stdout.includes('data-status="passed"')) {
    process.stderr.write(result.stderr);
    process.stderr.write(result.stdout);
    throw new Error(`Pixi'VN CDN smoke test failed for version ${version}`);
}

const reportedVersion = result.stdout.match(/data-version="([^"]+)"/)?.[1] || "unknown";
console.log(`Pixi'VN ${reportedVersion} loaded from jsDelivr; Game.init() and storage passed.`);
