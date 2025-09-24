import type { CharacterInterface } from "@drincs/pixi-vn";
import type { ApplicationOptions, AssetsManifest } from "@drincs/pixi-vn/pixi.js";
import { Plugin } from "vite";

let characters: CharacterInterface[] | null = null;
let labels: string[] | null = null;
let manifest: AssetsManifest | null = null;
let options: Partial<ApplicationOptions> | null = null;

/**
 * Vite plugin to handle pixi-vn related endpoints.
 * Endpoints:
 * - GET  /pixi-vn/characters       -> list of registered characters
 * - POST /pixi-vn/characters       -> update the list of registered characters
 * - GET  /pixi-vn/labels           -> list of registered labels
 * - POST /pixi-vn/labels           -> update the list of registered labels
 * - GET  /pixi-vn/assets/manifest  -> assets manifest
 * - POST /pixi-vn/assets/manifest  -> update assets manifest
 */
export function vitePluginPixivn(): Plugin {
    return {
        name: "vite-plugin-pixi-vn",
        configureServer(server) {
            server.middlewares.use("/pixi-vn/characters", (req, res) => {
                res.setHeader("Content-Type", "application/json");

                if (req.method === "GET") {
                    if (!characters) {
                        res.statusCode = 404;
                        res.end(JSON.stringify({ error: "Characters not initialized" }));
                        return;
                    }
                    res.statusCode = 200;
                    res.end(JSON.stringify(characters));
                }

                if (req.method === "POST") {
                    let body = "";
                    req.on("data", (chunk) => (body += chunk));
                    req.on("end", () => {
                        try {
                            characters = JSON.parse(body);
                            res.statusCode = 201;
                            res.end(JSON.stringify({ message: "Characters updated successfully" }));
                        } catch {
                            res.statusCode = 400;
                            res.end(JSON.stringify({ error: "Invalid JSON format" }));
                        }
                    });
                }
            });

            server.middlewares.use("/pixi-vn/labels", (req, res) => {
                res.setHeader("Content-Type", "application/json");

                if (req.method === "GET") {
                    if (!labels) {
                        res.statusCode = 404;
                        res.end(JSON.stringify({ error: "Labels not initialized" }));
                        return;
                    }
                    res.statusCode = 200;
                    res.end(JSON.stringify(labels));
                }

                if (req.method === "POST") {
                    let body = "";
                    req.on("data", (chunk) => (body += chunk));
                    req.on("end", () => {
                        try {
                            labels = JSON.parse(body);
                            res.statusCode = 201;
                            res.end(JSON.stringify({ message: "Labels updated successfully" }));
                        } catch {
                            res.statusCode = 400;
                            res.end(JSON.stringify({ error: "Invalid JSON format" }));
                        }
                    });
                }
            });

            server.middlewares.use("/pixi-vn/assets/manifest", (req, res) => {
                res.setHeader("Content-Type", "application/json");

                if (req.method === "GET") {
                    if (!manifest) {
                        res.statusCode = 404;
                        res.end(JSON.stringify({ error: "Manifest not initialized" }));
                        return;
                    }
                    res.statusCode = 200;
                    res.end(JSON.stringify(manifest));
                }

                if (req.method === "POST") {
                    let body = "";
                    req.on("data", (chunk) => (body += chunk));
                    req.on("end", () => {
                        try {
                            manifest = JSON.parse(body);
                            res.statusCode = 201;
                            res.end(JSON.stringify({ message: "Manifest updated successfully" }));
                        } catch {
                            res.statusCode = 400;
                            res.end(JSON.stringify({ error: "Invalid JSON format" }));
                        }
                    });
                }
            });

            server.middlewares.use("/pixi-vn/canvas/options", (req, res) => {
                res.setHeader("Content-Type", "application/json");

                if (req.method === "GET") {
                    if (!options) {
                        res.statusCode = 404;
                        res.end(JSON.stringify({ error: "Options not initialized" }));
                        return;
                    }
                    res.statusCode = 200;
                    res.end(JSON.stringify(options));
                }

                if (req.method === "POST") {
                    let body = "";
                    req.on("data", (chunk) => (body += chunk));
                    req.on("end", () => {
                        try {
                            options = JSON.parse(body);
                            res.statusCode = 201;
                            res.end(JSON.stringify({ message: "Options updated successfully" }));
                        } catch {
                            res.statusCode = 400;
                            res.end(JSON.stringify({ error: "Invalid JSON format" }));
                        }
                    });
                }
            });
        },
    };
}
