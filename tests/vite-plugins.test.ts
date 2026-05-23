import { EventEmitter } from "events";
import { beforeEach, describe, expect, test } from "vitest";
import {
    PIXIVN_DEV_API_ASSETS_MANIFEST,
    PIXIVN_DEV_API_CANVAS_OPTIONS,
    PIXIVN_DEV_API_CHARACTERS,
    PIXIVN_DEV_API_LABELS,
} from "../src/vite/costants";
import { vitePluginPixivn } from "../src/vite/plugins";

type MiddlewareHandler = (req: any, res: any) => void;

function createServer() {
    const handlers = new Map<string, MiddlewareHandler>();
    return {
        middlewares: {
            use(path: string, handler: MiddlewareHandler) {
                handlers.set(path, handler);
            },
        },
        getHandler(path: string): MiddlewareHandler {
            const handler = handlers.get(path);
            if (!handler) throw new Error(`No handler registered for ${path}`);
            return handler;
        },
    };
}

function createGetReq() {
    const req = new EventEmitter() as any;
    req.method = "GET";
    return req;
}

function createPostReq(body: string) {
    const req = new EventEmitter() as any;
    req.method = "POST";
    Promise.resolve().then(() => {
        req.emit("data", body);
        req.emit("end");
    });
    return req;
}

function createRes() {
    return {
        statusCode: 0,
        headers: {} as Record<string, string>,
        body: "",
        setHeader(key: string, value: string) {
            this.headers[key] = value;
        },
        end(data: string) {
            this.body = data;
        },
    };
}

describe("vitePluginPixivn", () => {
    test("returns a plugin with correct name and enforce", () => {
        const plugin = vitePluginPixivn();
        expect(plugin.name).toBe("vite-plugin-pixi-vn");
        expect(plugin.enforce).toBe("pre");
    });

    test("registers middleware for all expected endpoints", () => {
        const plugin = vitePluginPixivn();
        const server = createServer();
        plugin.configureServer(server);

        expect(() => server.getHandler(PIXIVN_DEV_API_CHARACTERS)).not.toThrow();
        expect(() => server.getHandler(PIXIVN_DEV_API_LABELS)).not.toThrow();
        expect(() => server.getHandler(PIXIVN_DEV_API_ASSETS_MANIFEST)).not.toThrow();
        expect(() => server.getHandler(PIXIVN_DEV_API_CANVAS_OPTIONS)).not.toThrow();
    });
});

describe.each([
    { label: "characters", endpoint: PIXIVN_DEV_API_CHARACTERS, data: [{ id: "char1" }] },
    { label: "labels", endpoint: PIXIVN_DEV_API_LABELS, data: ["label1", "label2"] },
    { label: "manifest", endpoint: PIXIVN_DEV_API_ASSETS_MANIFEST, data: { bundles: [] } },
    {
        label: "canvas options",
        endpoint: PIXIVN_DEV_API_CANVAS_OPTIONS,
        data: { width: 800, height: 600 },
    },
])("$label endpoint ($endpoint)", ({ endpoint, data }) => {
    let handler: MiddlewareHandler;

    beforeEach(() => {
        const plugin = vitePluginPixivn();
        const server = createServer();
        plugin.configureServer(server);
        handler = server.getHandler(endpoint);
    });

    test("sets Content-Type to application/json on GET", () => {
        const req = createGetReq();
        const res = createRes();
        handler(req, res);
        expect(res.headers["Content-Type"]).toBe("application/json");
    });

    test("GET returns 404 with error body when not initialized", () => {
        const req = createGetReq();
        const res = createRes();
        handler(req, res);
        expect(res.statusCode).toBe(404);
        expect(JSON.parse(res.body)).toHaveProperty("error");
    });

    test("POST with valid JSON returns 201 with message", async () => {
        const req = createPostReq(JSON.stringify(data));
        const res = createRes();
        handler(req, res);
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(res.statusCode).toBe(201);
        expect(JSON.parse(res.body)).toHaveProperty("message");
    });

    test("GET after POST returns stored data with status 200", async () => {
        const postReq = createPostReq(JSON.stringify(data));
        const postRes = createRes();
        handler(postReq, postRes);
        await new Promise((resolve) => setTimeout(resolve, 0));

        const getReq = createGetReq();
        const getRes = createRes();
        handler(getReq, getRes);
        expect(getRes.statusCode).toBe(200);
        expect(JSON.parse(getRes.body)).toEqual(data);
    });

    test("POST with invalid JSON returns 400 with error body", async () => {
        const req = createPostReq("not-valid-json{{{");
        const res = createRes();
        handler(req, res);
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body)).toHaveProperty("error");
    });
});
