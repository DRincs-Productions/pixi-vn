# Pixi’VN - PixiJS Game Engine

![pixi-vn-cover](https://github.com/user-attachments/assets/6a4951d3-459f-4f8d-ae3d-1342a55570e9)

<p align="center">
  <a href="https://www.npmjs.com/package/@drincs/pixi-vn" rel="noopener noreferrer nofollow"><img src="https://img.shields.io/npm/v/@drincs/pixi-vn?label=version" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@drincs/pixi-vn" rel="noopener noreferrer nofollow"><img src="https://img.shields.io/npm/dm/@drincs/pixi-vn" alt="npm downloads per month"></a>
  <a target="_blank" href="https://www.jsdelivr.com/package/npm/@drincs/pixi-vn" rel="noopener noreferrer nofollow"><img alt="jsDelivr hits (npm)" src="https://img.shields.io/jsdelivr/npm/hm/@drincs/pixi-vn?logo=jsdeliver"></a>
  <a href="https://www.npmjs.com/package/@drincs/pixi-vn" rel="noopener noreferrer nofollow"><img alt="NPM License" src="https://img.shields.io/npm/l/@drincs/pixi-vn"></a>
  <a target="_blank" href="https://discord.gg/E95FZWakzp" rel="noopener noreferrer nofollow"><img alt="Discord" src="https://img.shields.io/discord/1263071210011496501?color=7289da&label=discord"></a>
</p>

Pixi’VN is a very versatile and powerful story-driven engine. It is based on JavaScript/TypeScript and [PixiJS](https://pixijs.com/), and supports animated characters through [Spine 2D](https://esotericsoftware.com/) and [Live2D](https://www.live2d.com/).

Pixi’VN aims to be an innovative and fast engine, and puts a strong emphasis on AI-assisted development: an AI agent can start your game, gain all the knowledge it needs about your project through [Agent Skills](#agent-skills), and test the game by launching it in a browser — with the ability to keep driving it from the outside while it plays.

You can use narrative languages that are able to take full advantage of the engine's features, as well as any custom features you add to your project. Currently supported:

- [_ink_](https://pixi-vn.com/ink/ink)

## Templates

For a quick start, various project templates are available, built with React. Less experienced developers can use these templates without much knowledge of JavaScript/TypeScript.

- **[Visual Novel](https://pixi-vn.com/start/make-visual-novel)**: a classic dialogue-driven experience, with characters, backgrounds, and choices.
- **[Point & Click Adventure](https://pixi-vn.com/nqtr/make-point-and-click)**: an adventure game where the player explores scenes and interacts with objects and characters.
- **Interactive Fiction**: feels like reading a book. Unlike a visual novel, images are shown as vignettes, just as illustrations would appear on a page.

To create a new project from a template, run:

```npm
npm create pixi-vn@latest
```

### Distribution

Pixi’VN is independent of any distribution technology, but strong emphasis is being placed on [Roves](https://roves.pixi-vn.com/), built by the same team behind Pixi’VN.

| Platform | [Roves](https://roves.pixi-vn.com/) | [Tauri](https://v2.tauri.app/) | [Electron](https://www.electronjs.org/) |
| -------- | -- | -- | -- |
| Windows | ✅ | ✅ | ✅ |
| macOS | ✅ | ✅ | ✅ |
| Linux | ✅ | ✅ | ✅ |
| Android | 🚧 | ✅ | ❌ |
| iOS | 🚧 | ✅ | ❌ |
| Nintendo | 🚧 | ❌ | ❌ |
| PlayStation | 🚧 | ❌ | ❌ |
| Xbox | 🚧 | ❌ | ❌ |

## Wiki

- [Quick Start](https://pixi-vn.com/start/getting-started)
  - [Templates](https://pixi-vn.com/start/templates)
- Features:
  - [Characters](https://pixi-vn.com/start/character)
  - [Narration](https://pixi-vn.com/start/narration)
  - [Assets](https://pixi-vn.com/start/assets)
  - [Canvas WebGL/WebGPU](https://pixi-vn.com/start/canvas)
  - [Sounds and music](https://pixi-vn.com/start/sound)
  - [Storage](https://pixi-vn.com/start/storage)
  - [User Interface (UI)](https://pixi-vn.com/start/interface)
  - [Minigames](https://pixi-vn.com/start/minigames)
  - [AI-Generated Content](https://pixi-vn.com/start/ai-generated-content)
  - [Save and load](https://pixi-vn.com/start/save)
  - [Distribution](https://pixi-vn.com/start/distribution)

## Prerequisites

Before starting, you must have the following tools installed:

- [Node.js](https://nodejs.org/) version 18 or higher.
- Text editor with TypeScript support, such as:
  - [Visual Studio Code](https://code.visualstudio.com/)
  - [Cursor](https://www.cursor.com/)
  - [VSCodium](https://vscodium.com/)

## Installation

To install the Pixi’VN package in an existing JavaScript project, use one of the following commands:

```npm
npm install @drincs/pixi-vn
```

## Initialize

Before using the Pixi’VN engine, you must initialize the game. You can do this by calling the `Game.init` method.

```ts title="src/main.tsx"
import { Game } from "@drincs/pixi-vn";

const body = document.body;
if (!body) {
  throw new Error("body element not found");
}

Game.init(body, {
  height: 1080,
  width: 1920,
  backgroundColor: "#303030",
}).then(() => {
  // ...
  Game.start("start", {});
});

// read more here: https://pixi-vn.com/start/other-narrative-features.html#how-manage-the-end-of-the-game
Game.onEnd(async (props) => {
  Game.clear();
  // navigate to main menu
});

Game.addOnError((error, props) => {
  console.error(`Error occurred`, error);
});

Game.onNavigate((path) => navigateTo(path));
```

```html title="index.html"
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Game</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

```css title="styles.css"
html,
body {
  background-color: #242424;
  height: 100%;
}

body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  overflow: hidden;
}
```

## Agent Skills

Pixi'VN ships a set of [Agent Skills](https://www.skills.sh/) that teach AI coding assistants (like Claude Code) how to correctly use each part of the engine. If you use Claude Code, you can install all of them into your project with:

```npm
npx skills add DRincs-Productions/pixi-vn --all
```

This installs every skill below and prompts you to pick which ones to keep. To install only specific ones, add `--skill <name>` (repeat the flag to install several, e.g. `--skill canvas --skill sound`). Use `--list` instead of installing to just see what's available. Available skills:

- `getting-started` — installing the package and initializing the `Game`
- `assets` — local vs. online assets, the manifest/bundle/alias system, and loading strategy
- `canvas` — images, sprites, text, video, transitions and effects
- `characters` — defining and registering characters
- `history` — going back/rewinding and reading the narration backlog
- `narration` — labels, dialogue and choices
- `saves` — exporting/restoring game state and persisting save files
- `sound` — music, sound effects and audio channels
- `storage` — game variables, flags and stored classes
- `testing` — driving/inspecting a running game from an AI agent or script via `Game.testing`, for automated play-testing
- `ui` — mounting HTML/PixiJS UI layers over the canvas, screen navigation, theming, and connecting UI to storage
- `migration` — upgrading an existing project to the current version
