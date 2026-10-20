import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createServer } from "node:http";
import { homedir } from "node:os";
import { delimiter, extname, join, relative, resolve, sep } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const packageJson = JSON.parse(readFileSync(join(projectRoot, "package.json"), "utf8"));
const packageLock = JSON.parse(readFileSync(join(projectRoot, "package-lock.json"), "utf8"));
const mode = process.argv[2] || "local";

if (mode !== "local" && mode !== "public") {
    throw new Error("Usage: node scripts/test-pencode-cdn.mjs [local|public]");
}

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

function makeImportMap(origin) {
    const imports = {};
    for (const [subpath, entry] of Object.entries(packageJson.exports)) {
        const specifier =
            subpath === "." ? packageJson.name : `${packageJson.name}/${subpath.slice(2)}`;
        imports[specifier] = `${origin}/dist/${relative(
            join(projectRoot, "dist"),
            join(projectRoot, entry.import.replace(/^\.\/dist\//, "dist/")),
        )
            .split(sep)
            .join("/")}`;
    }

    for (const dependency of Object.keys(packageJson.peerDependencies)) {
        if (dependency === "vite") continue;
        const installed = packageLock.packages[`node_modules/${dependency}`];
        if (!installed) {
            throw new Error(`Peer dependency ${dependency} is missing from package-lock.json`);
        }
        imports[dependency] =
            `https://cdn.jsdelivr.net/npm/${dependency}@${installed.version}/+esm`;
    }

    return { imports };
}

const fixture = readFileSync(join(projectRoot, "tests", "pencode-jsdelivr.html"), "utf8");
const distRoot = resolve(projectRoot, "dist");
let serverOrigin;

const server = createServer((request, response) => {
    const pathname = new URL(request.url || "/", serverOrigin).pathname;
    if (pathname === "/" || pathname === "/tests/pencode-jsdelivr.html") {
        const importMap = mode === "local" ? makeImportMap(serverOrigin) : { imports: {} };
        response.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
        });
        response.end(
            fixture.replace(
                "<!-- PIXIVN_IMPORT_MAP -->",
                `<script type="importmap">${JSON.stringify(importMap)}</script>`,
            ),
        );
        return;
    }

    if (pathname.startsWith("/dist/")) {
        const filePath = resolve(distRoot, decodeURIComponent(pathname.slice("/dist/".length)));
        if (!filePath.startsWith(`${distRoot}${sep}`) || !existsSync(filePath)) {
            response.writeHead(404).end("Not found");
            return;
        }
        const contentType =
            extname(filePath) === ".js" || extname(filePath) === ".mjs"
                ? "text/javascript; charset=utf-8"
                : "application/octet-stream";
        response.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-store" });
        response.end(readFileSync(filePath));
        return;
    }

    response.writeHead(404).end("Not found");
});

await new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolveListen);
});
serverOrigin = `http://127.0.0.1:${server.address().port}`;

const browser = findBrowser();
const version = mode === "local" ? "local" : process.env.PIXIVN_CDN_VERSION || "latest";
const pageUrl = new URL("/tests/pencode-jsdelivr.html", serverOrigin);
pageUrl.searchParams.set("source", mode);
pageUrl.searchParams.set("version", version);

try {
    const result = await new Promise((resolveRun, rejectRun) => {
        const child = spawn(
            browser,
            [
                "--headless",
                "--no-sandbox",
                "--disable-gpu",
                "--dump-dom",
                "--virtual-time-budget=45000",
                pageUrl.href,
            ],
            { stdio: ["ignore", "pipe", "pipe"] },
        );
        let stdout = "";
        let stderr = "";
        const timeout = setTimeout(() => {
            child.kill("SIGKILL");
            rejectRun(new Error("Chrome timed out while running the Pencode CDN smoke test"));
        }, 90_000);
        child.stdout.setEncoding("utf8").on("data", (chunk) => (stdout += chunk));
        child.stderr.setEncoding("utf8").on("data", (chunk) => (stderr += chunk));
        child.once("error", (error) => {
            clearTimeout(timeout);
            rejectRun(error);
        });
        child.once("exit", (code, signal) => {
            clearTimeout(timeout);
            resolveRun({ code, signal, stdout, stderr });
        });
    });

    if (result.code !== 0) {
        process.stderr.write(result.stderr);
        throw new Error(`Chrome exited with ${result.signal || `status ${result.code}`}`);
    }
    if (!result.stdout.includes('data-status="passed"')) {
        process.stderr.write(result.stderr);
        process.stderr.write(result.stdout);
        throw new Error(`Pixi'VN ${mode} CDN smoke test failed for version ${version}`);
    }

    const reportedVersion = result.stdout.match(/data-version="([^"]+)"/)?.[1] || "unknown";
    console.log(
        mode === "local"
            ? `Pixi'VN ${reportedVersion} loaded from local dist with jsDelivr-mapped peer dependencies; Game.init() and storage passed.`
            : `Pixi'VN ${reportedVersion} loaded from jsDelivr; Game.init() and storage passed.`,
    );
} finally {
    await new Promise((resolveClose) => server.close(resolveClose));
}
