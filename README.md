# Pixi’VN - PixiJS Game Engine

![pixi-vn-cover](https://github.com/user-attachments/assets/28c41fe1-c539-4ebb-b7d4-8cb9f79e089e)

Pixi’VN is a very versatile and powerful 2D game engine. It is based on JavaScript/TypeScript and [PixiJS](https://pixijs.com/).

It provides the following features:

* narrative management
* provides a 2D canvas
* providing functionality to play sounds and music
* storage to set and get game variables.
* saves the current state of the entire game at each "story step" giving the possibility to go back
* functionality to save and load the current state of the game.

For a quick start, various [project templates](#project-initialization) are available. Less experienced developers can use these templates without much knowledge of JavaScript/TypeScript.

You have the option to use various types of narrative languages ​​(in addition to JavaScript/TypeScript). Currently you can use the following:

* [*ink*](https://pixi-vn.web.app/ink/ink)
* [Ren'Py](https://pixi-vn.web.app/renpy/renpy)

Pixi’VN does not provide built-in components to create the game UI. Instead, you should use external JavaScript frameworks to build your UI. This allows you to leverage systems such as React, Vue, etc., to create complex and high-performance **UI screens**.

* [React](https://pixi-vn.web.app/start/interface-react)
* [Vue](https://pixi-vn.web.app/start/interface-vue)
* [PixiJS](https://pixi-vn.web.app/start/interface-pixijs)

## Wiki

* [Why Pixi’VN?](https://pixi-vn.web.app/start/why)
  * [Ren'Py vs Pixi’VN](https://pixi-vn.web.app/start/versus-renpy)
* [Quick Start](https://pixi-vn.web.app/start/getting-started)
  * [Templates](https://pixi-vn.web.app/start/templates)
* Make your first:
  * [Visual Novel](https://pixi-vn.web.app/start/make-visual-novel)
  * [Point & Click Adventure](https://pixi-vn.web.app/nqtr/make-point-and-click)
  * [RPG game](https://pixi-vn.web.app/start/make-rpg)
  * [IDE or graphical editor](https://pixi-vn.web.app/start/make-ide)
  * [Game engine](https://pixi-vn.web.app/start/make-game-engine)

## Prerequisites

Before starting, you must have the following tools installed:

* [Node.js](https://nodejs.org/) version 18 or higher.
* Text editor with TypeScript support, such as:
  * [Visual Studio Code](https://code.visualstudio.com/)
  * [Cursor](https://www.cursor.com/)
  * [VSCodium](https://vscodium.com/)
* (Recommended) [Git](https://git-scm.com/)
  * A [GitHub account](https://github.com/)

## Project Initialization

If you want to start from a new project, you can use the following command to initialize a new project with the Pixi’VN templates:

```bash
# npm
npm create pixi-vn@latest

# yarn
yarn create pixi-vn

# pnpm
pnpm create pixi-vn

# bun
bun create pixi-vn

# deno
deno init --npm pixi-vn
```

You can see the list of available templates and interactive demos [here](https://pixi-vn.web.app/start/templates).

After the project is initialized, open the project directory with your text editor (VSCode is recommended) and start developing your project.

All templates include a `README.md` file with more information about the project.

## Installation

To install the Pixi’VN package in an existing JavaScript project, use one of the following commands:

```bash
# npm
npm install @drincs/pixi-vn

# yarn
yarn add @drincs/pixi-vn

# pnpm
pnpm add @drincs/pixi-vn

# bun
bun add @drincs/pixi-vn

# deno
deno install npm:@drincs/pixi-vn
```

## Initialize

Before using the Pixi’VN engine, you must initialize the game. You can do this by calling the `Game.init` method.

This function has the following parameters:

* `element`: The HTML element to append the canvas to.
* `options`: Equivalent to the options you can use when initializing a [PixiJS Application](https://pixijs.com/8.x/guides/basics/getting-started#creating-an-application). The following options are mandatory:
  * `width`: The width of the canvas.
  * `height`: The height of the canvas.
* `devtoolsOptions`: Equivalent to the options you can use when initializing the [PixiJS Devtools](https://pixi-vn.web.app/it/start/canvas#use-pixijs-devtools-with-pixivn).

```ts title="src/main.tsx"
import { Game } from "@drincs/pixi-vn";

// Canvas setup with PIXI
const body = document.body
if (!body) {
    throw new Error('body element not found')
}

Game.init(body, {
    height: 1080,
    width: 1920,
    backgroundColor: "#303030",
    resizeMode: "contain",
}).then(() => {
    // ...
});

// read more here: https://pixi-vn.web.app/start/other-narrative-features.html#how-manage-the-end-of-the-game
Game.onEnd(async (props) => {
    Game.clear();
    props.navigate("/");
});

Game.onError((type, error, { notify }) => {
    notify("allert_error_occurred");
});
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

```css title="src/styles.css"
:root {
  background-color: #242424;
}

html,
body {
  height: 100%;
}

body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  overflow: hidden;
}
```
