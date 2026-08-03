---
name: pixi-vn-assets
description: Use when adding, organizing, registering, or loading non-code files (images, audio, video) in a Pixi'VN project — local assets processed by PixiJS AssetPack vs. online/remote-hosted assets, the AssetsManifest/bundle/alias system, where to edit the manifest for each case, and when to load bundles (at startup, in the background, per-label, per-route). Load this before writing any code that references an image/sound/video path directly, or before adding entries to a manifest.
---

# Pixi'VN Assets: local vs. online, manifests, bundles, and loading strategy

Official docs: [pixi-vn.com/start/assets](https://pixi-vn.com/start/assets) (storage options) and
[pixi-vn.com/start/assets-management](https://pixi-vn.com/start/assets-management) (loading
strategy).

## When to use this skill

Use this skill whenever a task involves adding a new image/audio/video file to a project, deciding
whether an asset should live locally or be hosted online, editing the assets manifest, or choosing
when a bundle of assets should load (blocking at startup, in the background, per-label, per-route).
This skill does not cover _how_ an image/sound is displayed/played once loaded — that's
`pixi-vn-canvas` / `pixi-vn-sound` — only how it gets registered and made available by alias.

**The one rule that matters most: always reference assets by their manifest `alias`, never by raw
`src` path/URL, in game code.** Loading by path directly is strongly discouraged — it couples code
to a specific file location/host, so moving a file or switching hosting providers silently breaks
every reference. `Assets.load("bg01-hallway")`, not `Assets.load("https://.../bg01-hallway.webp")`.

## Local vs. online assets

Assets can be stored **locally** in the project or hosted **online** (a CDN, GitHub raw, cloud
storage). Frequently used assets (character sprites, backgrounds, background music) are best kept
local; assets used once, or large optional files, are better hosted online to keep the project
small and the initial download fast.

|                      | Local                                                     | Online                                |
| -------------------- | --------------------------------------------------------- | ------------------------------------- |
| Bundled into the app | Yes — ships in `public/assets`                            | No — fetched at runtime from a URL    |
| Best for             | Frequently used assets (backgrounds, sprites, core music) | Large/optional/rarely-used assets     |
| Requires             | PixiJS AssetPack (pre-configured in official templates)   | A CORS-enabled host with a public URL |

## Local assets: the `src/assets` folder + PixiJS AssetPack

Local assets go under `src/assets` (any folder works, but this is the convention every official
template uses), organized into subfolders however makes sense for the project. **PixiJS AssetPack**
— pre-wired into the Vite config of every official template — watches this folder and, on every
change (`vite dev`) or once before a production build (`vite build`), optimizes the files
(compression, WebP/AVIF conversion, texture-atlas packing) into `public/assets`, and **auto-generates
`src/assets/manifest.gen.json`** describing every resulting bundle/alias.

```ts
// vite.config.ts (already present in official templates — no changes usually needed)
import { AssetPack } from "@assetpack/core";
import assetPackConfig from "./.assetpack.ts";
// a Vite plugin runs `new AssetPack(assetPackConfig).watch()` in dev,
// `.run()` once during `vite build`
```

```ts
// .assetpack.ts (already present in official templates)
import { pixiPipes } from "@assetpack/core/pixi";

export default {
  entry: "./src/assets",
  output: "./public/assets",
  ignore: ["**/*.ts", "**/*.js", "**/*.gen.*"],
  pipes: [
    pixiPipes({ manifest: { output: "src/assets/manifest.gen.json" } }),
    // official templates add two extra pipes here: one bundle per top-level
    // folder (instead of everything in a single "default" bundle), and
    // stripping file extensions from generated aliases
  ],
};
```

**`src/assets/manifest.gen.json` is generated — never hand-edit it.** Any manual change is
overwritten the next time AssetPack runs. If a local asset isn't showing up with the alias you
expect, check the actual file's path/name under `src/assets` and let AssetPack regenerate the file,
rather than editing the JSON directly.

```json
// src/assets/manifest.gen.json (excerpt — auto-generated, read-only)
{
  "bundles": [
    {
      "name": "mc",
      "assets": [{ "alias": "mc-neutral", "src": "./assets/mc/mc-neutral.png" }]
    }
  ]
}
```

## Online assets: the exact place to register them — `src/assets/index.ts`

For assets you host online (or any manifest entries beyond what AssetPack generates), **the one
place to add/edit them is `src/assets/index.ts`**, present in every official template. It imports
the auto-generated local manifest and appends hand-written bundles for remote URLs:

```ts
// src/assets/index.ts — the exact, single point to add/modify online assets
import generatedManifestJson from "@/assets/manifest.gen.json";
import type { AssetsManifest } from "@drincs/pixi-vn";

export const manifest: AssetsManifest = {
  bundles: [
    ...generatedManifestJson.bundles, // everything AssetPack generated locally
    {
      name: "audio", // pick a bundle name (see "Organizing into bundles" below)
      assets: [
        {
          alias: "bgm_cheerful",
          src: "https://your-cdn.example.com/audio/bgm_cheerful.wav",
        },
        {
          alias: "sfx_whoosh",
          src: "https://your-cdn.example.com/audio/sfx_whoosh.wav",
        },
      ],
    },
  ],
};
```

Popular CORS-friendly hosting options (see [pixi-vn.com/start/assets#assets-hosting](https://pixi-vn.com/start/assets#assets-hosting) for the full comparison of price/limits/editability):
GitHub raw URLs (`https://raw.githubusercontent.com/[repo]/refs/heads/main/[path]`, free, 100MB/file
limit), image-hosting services (imgbb/imgur, images only), or cloud storage (Cloudflare R2, Firebase
Storage, S3, Supabase) for anything larger or non-image. Whichever host is used, it must allow
**CORS requests** or the browser will block loading the asset.

## Organizing assets into bundles

Group related assets into **bundles** instead of registering each one loosely — a bundle loads (or
defers loading) as a single unit. Name each bundle after **where it's used**:

- a label's id (e.g. `startLabel.id`) for assets only that label needs
- a route's path (e.g. `"/"`, `"/game/narration"`) for assets a specific screen needs
- a character's id for that character's sprite/expression assets

This convention matters most for **online** assets, where it directly controls what the player
waits for; for local assets (which load near-instantly) precise bundle boundaries matter far less.

```ts
// src/assets/index.ts
import { startLabel } from "@/content/labels/start.label";

export const manifest: AssetsManifest = {
  bundles: [
    { name: "/", assets: [{ alias: "background_main_menu", src: "..." }] }, // main menu route
    { name: startLabel.id, assets: [{ alias: "bg01-hallway", src: "..." }] }, // one label
    { name: "mc", assets: [{ alias: "mc-neutral", src: "..." }] }, // one character
  ],
};
```

## Initializing and loading

Register the manifest once, near app startup, before relying on any alias:

```ts
import { manifest } from "@/assets";
import { Assets } from "@drincs/pixi-vn";

let assetsInitialized = false;
export async function defineAssets() {
  if (!assetsInitialized) {
    await Assets.init({ manifest });
    assetsInitialized = true;
  }
  await Assets.loadBundle("/"); // block on what the first screen needs
  Assets.backgroundLoadBundle("audio"); // load the rest quietly in the background
}
```

Then reference assets purely by alias, anywhere (`pixi-vn-canvas` for images/video,
`pixi-vn-sound` for audio):

```ts
const texture = await Assets.load("mc-neutral");
```

By default assets load on demand, but waiting until the exact moment an asset is needed can cause a
visible stall. Common, recommended loading moments, least-to-most eager:

- **At label start (background)** — in a label's `onLoadingLabel` hook, call
  `Assets.backgroundLoadBundle(label.id)` (fire-and-forget): the label starts immediately, its
  bundle streams in without blocking. Prefer this over the blocking variant below unless a step
  genuinely cannot proceed without the asset.
- **At label start (blocking)** — same hook, but `await Assets.loadBundle(label.id)`: the label
  waits for its bundle before its first step runs. Only use this when the label truly can't start
  without those assets.
- **At project start** — `await Assets.loadBundle(...)` for anything used on the very first screen
  (recommended limit: under 100MB, so the initial wait stays short).
- **In the background at project start** — `Assets.backgroundLoadBundle(...)` for larger,
  non-blocking preloading (recommended limit: under 2GB).
- **Before a route/screen renders** — inside a router's `loader` (e.g. TanStack Router), call
  `await Assets.loadBundle(routePath)`, paired with a `pendingComponent` so the player sees a
  loading state instead of a blank screen.

## Real-world project convention (official React template)

`src/lib/utils/assets-utility.ts`'s `defineAssets()` combines several of the strategies above: guards
`Assets.init` with an `assetsInitialized` flag (safe to call more than once), **blocks** on the
current route's bundle (`await Assets.loadBundle("/")`) so the first screen never shows missing
assets, then kicks off the audio bundle in the **background** (`sound.backgroundLoadBundle(...)` —
the sound module's own wrapper, not `Assets.backgroundLoadBundle`, since it also has to wire the
loaded media into a channel). Separately, `main.tsx` wires `Game.onLoadingLabel((_stepId, { id }) =>
Assets.backgroundLoadBundle(id))` **once, globally** — so every label's own bundle (named after its
id, per the convention above) is background-loaded automatically the moment that label starts,
without every label needing its own `onLoadingLabel` hook. This is the template's convention, not a
library requirement — a project is free to load more/less eagerly.

For caching **online** assets so returning players don't re-download them: official templates
pre-configure [VitePWA](https://vite-pwa-org.netlify.app/)'s service worker to cache responses from
specific hostnames (a `CACHED_EXTERNAL_HOSTNAMES` list in `vite.config.ts`) for 7 days by default —
add any CDN/host actually used to that list. See
[pixi-vn.com/start/assets#caching-assets](https://pixi-vn.com/start/assets#caching-assets).

## Related skills

- **pixi-vn-getting-started** — the `@drincs/pixi-vn/vite` plugin's `assetsManifest` option bridges
  a manifest (often this skill's `src/assets/index.ts`) into the plugin's generated type file and
  dev-server endpoint; `Game.onLoadingLabel` is where label-scoped bundle loading is wired.
- **pixi-vn-canvas** — displaying images/video once their alias is loaded.
- **pixi-vn-sound** — playing audio once its alias is loaded, and the sound module's own
  `backgroundLoadBundle`/`loadBundle` wrappers.
- **pixi-vn-narration** — labels are a natural bundle-naming unit (`label.id`).
