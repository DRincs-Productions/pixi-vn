import { describe, expect, test } from "vitest";
import { vitePluginPixivn } from "../src/vite/plugins";

function resolve(plugin: ReturnType<typeof vitePluginPixivn>, command: "serve" | "build") {
    (plugin.configResolved as any)({ root: "/tmp", command, logger: { info() {}, error() {} } });
}

describe("vitePluginPixivn: Game.testing auto-injection", () => {
    test("serve + default options: injects a script tag referencing the virtual module", () => {
        const plugin = vitePluginPixivn();
        resolve(plugin, "serve");

        const tags = (plugin.transformIndexHtml as any)();
        expect(tags).toEqual([
            {
                tag: "script",
                attrs: { type: "module", src: "/@id/virtual:pixi-vn-testing" },
                injectTo: "head-prepend",
            },
        ]);
    });

    test("build: never injects, regardless of the testing option", () => {
        const plugin = vitePluginPixivn();
        resolve(plugin, "build");
        expect((plugin.transformIndexHtml as any)()).toEqual([]);

        const plugin2 = vitePluginPixivn({ testing: true });
        resolve(plugin2, "build");
        expect((plugin2.transformIndexHtml as any)()).toEqual([]);
    });

    test("testing: false: never injects, even while serving", () => {
        const plugin = vitePluginPixivn({ testing: false });
        resolve(plugin, "serve");
        expect((plugin.transformIndexHtml as any)()).toEqual([]);
    });

    test("virtual module resolves and loads to a Game.testing.enable() call", () => {
        const plugin = vitePluginPixivn();
        const resolved = (plugin.resolveId as any)("virtual:pixi-vn-testing");
        expect(resolved).toBe("\0virtual:pixi-vn-testing");
        expect((plugin.resolveId as any)("something-else")).toBeUndefined();

        const code = (plugin.load as any)(resolved);
        expect(code).toContain('import { Game } from "@drincs/pixi-vn";');
        expect(code).toContain("Game.testing.enable();");

        expect((plugin.load as any)("\0something-else")).toBeUndefined();
    });

    test("testing.windowKey: forwarded to the injected Game.testing.enable(...) call", () => {
        const plugin = vitePluginPixivn({ testing: { windowKey: "myGameTesting" } });
        const code = (plugin.load as any)("\0virtual:pixi-vn-testing");
        expect(code).toContain('Game.testing.enable({"windowKey":"myGameTesting"});');
    });
});
