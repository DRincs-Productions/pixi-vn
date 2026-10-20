import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { delimiter, join } from "node:path";
import { spawn } from "node:child_process";
import { createServer } from "vite";

const projectRoot = new URL("..", import.meta.url).pathname;

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

const server = await createServer({
    configFile: false,
    root: projectRoot,
    server: { host: "127.0.0.1", port: 0 },
});

try {
    await server.listen();
    const address = server.httpServer.address();
    if (!address || typeof address === "string") {
        throw new Error("Could not determine the local test server address");
    }

    const browser = findBrowser();
    const pagePaths = process.argv.slice(2);
    const pages =
        pagePaths.length > 0
            ? pagePaths
            : ["/tests/pencode-local.html", "/tests/codepen-local.html"];

    for (const pagePath of pages) {
        const pageUrl = `http://127.0.0.1:${address.port}${pagePath}`;
        const result = await new Promise((resolveRun, rejectRun) => {
            const child = spawn(
                browser,
                [
                    "--headless",
                    "--no-sandbox",
                    "--disable-gpu",
                    "--dump-dom",
                    "--virtual-time-budget=45000",
                    pageUrl,
                ],
                { stdio: ["ignore", "pipe", "pipe"] },
            );
            let stdout = "";
            let stderr = "";
            const timeout = setTimeout(() => {
                child.kill("SIGKILL");
                rejectRun(new Error("Chrome timed out while running the local Pencode smoke test"));
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
            throw new Error(`The local browser smoke test failed at ${pagePath}`);
        }

        const reportedVersion = result.stdout.match(/data-version="([^"]+)"/)?.[1] || "unknown";
        console.log(`Passed ${pagePath} with local Pixi'VN ${reportedVersion}.`);
    }
} finally {
    await server.close();
}
