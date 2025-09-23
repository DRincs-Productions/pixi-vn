import type { CharacterInterface } from "@drincs/pixi-vn";
import type { AssetsManifest } from "@drincs/pixi-vn/pixi.js";
import { Plugin } from "vite";

let characters: CharacterInterface[] = [];
let labels: string[] = [];
let manifest: AssetsManifest = {
    bundles: [],
};

/**
 * Vite plugin to handle pixi-vn related endpoints.
 * List:
 * - GET /pixi-vn/characters: Get the list of registered characters.
 * - POST /pixi-vn/characters: Update the list of registered characters.
 * - GET /pixi-vn/labels: Get the list of registered labels.
 * - POST /pixi-vn/labels: Update the list of registered labels.
 * - GET /pixi-vn/assets: Get the list of all assets loaded in the Assets resolver.
 * - POST /pixi-vn/assets: Update the list of all assets loaded in the Assets resolver.
 * @returns The vite plugin.
 */
export function vitePluginPixivn(): Plugin {
    return {
        name: "vite-plugin-pixi-vn",
        configureServer(server) {
            // endpoint GET
            server.middlewares.use("/pixi-vn/characters", (req, res) => {
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(characters));
            });
            // endpoint POST
            server.middlewares.use("/pixi-vn/characters", (req, res) => {
                let body = "";
                req.on("data", (chunk) => (body += chunk));
                req.on("end", () => {
                    characters = JSON.parse(body);
                    res.end("ok");
                });
            });

            // endpoint GET
            server.middlewares.use("/pixi-vn/labels", (req, res) => {
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(labels));
            });
            // endpoint POST
            server.middlewares.use("/pixi-vn/labels", (req, res) => {
                let body = "";
                req.on("data", (chunk) => (body += chunk));
                req.on("end", () => {
                    labels = JSON.parse(body);
                    res.end("ok");
                });
            });

            // endpoint GET
            server.middlewares.use("/pixi-vn/manifest", (req, res) => {
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(manifest));
            });
            // endpoint POST
            server.middlewares.use("/pixi-vn/manifest", (req, res) => {
                let body = "";
                req.on("data", (chunk) => (body += chunk));
                req.on("end", () => {
                    manifest = JSON.parse(body);
                    res.end("ok");
                });
            });
        },
    };
}
