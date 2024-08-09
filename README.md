# Pixi'VN - PixiJS Visual Novel Engine

Pixi’VN is a npm package that provides various features for creating visual novels, has functions to manage story steps, saving and loading, variable storage, dialogues, character,canvas management, and much more.

Pixi’VN + [Templates](#project-initialization) provides a complete solution and is in effect a visual novel engine.

It is designed for web developers, with basic experience in JavaScript/TypeScript, who want to create a visual novel with a modern 2D rendering engine and their favorite JavaScript framework.

It is based on [Pixi.js](https://pixijs.com/), a rendering engine that allows you to create fast 2D graphics. It is based on WebGL and is very fast and efficient. It is used by many developers to create games, websites, and applications.

In addition to managing the Pixi.js "Canvas", Pixi’VN offers the possibility of adding an HTML Element with the same dimensions as the "Canvas" to add interactions with the user.

This allows the use of systems such as React, Vue, Angular, etc. to create much more complex **interface screens** with excellent performance.

## Wiki

For more information, visit the [Web Page](https://pixi-vn.web.app/)

* [Why Pixi’VN?](https://pixi-vn.web.app/start/why.html)
* [Get Started](https://pixi-vn.web.app/start/getting-started.html)
* [Interface with JavaScript Framework](https://pixi-vn.web.app/start/interface.html)

### First steps

* [Characters](https://pixi-vn.web.app/start/character.html)
* Narration:
  * [Dialogue](https://pixi-vn.web.app/start/dialogue.html)
  * [Label and Game Step](https://pixi-vn.web.app/start/labels.html)
  * [Choice Menus](https://pixi-vn.web.app/start/choices.html)
  * [History](https://pixi-vn.web.app/start/history.html)
* Storage:
  * [Game Storage](https://pixi-vn.web.app/start/storage.html)
  * [Flags Management](https://pixi-vn.web.app/start/flags.html)
  * [Stored Classes](https://pixi-vn.web.app/start/stored-classes.html)
* [Save and Load](https://pixi-vn.web.app/start/save.html)
* Canvas:
  * [Images and Transitions](https://pixi-vn.web.app/start/images.html)
  * [Canvas Elements](https://pixi-vn.web.app/start/canvas-elements.html)
  * [Animations and Effects](https://pixi-vn.web.app/start/animations-effects.html)
  * [Tickers](https://pixi-vn.web.app/start/tickers.html)

## Advanced topics

* [Intecept Events](https://pixi-vn.web.app/advanced/intercept-events.html)
* [Distribution](https://pixi-vn.web.app/advanced/distribution.html)
* [Mobile distribution](https://pixi-vn.web.app/advanced/distribution%E2%80%90mobile.html)

## Prerequisites

* [Node.js](https://nodejs.org/) version 18 or higher.
* Text Editor with TypeScript support.
  * [Visual Studio Code](https://code.visualstudio.com/) is recommended.

## Project Initialization

To initialize a new project, you can use the following command:

```bash
# npm
npm create pixi-vn@latest

# yarn
yarn create pixi-vn@latest

# pnpm
pnpm create pixi-vn@latest

# bun
bun create pixi-vn@latest
```

The supported template presets are:

**[Basic Visual Novel - Web page (Vite + React + MUI joy)](https://github.com/DRincs-Productions/pixi-vn-react-template)**

( More templates will be added in the future, see this [issue](https://github.com/DRincs-Productions/pixi-vn/issues/162) for more information )

After the project is initialized, you can open the project directory with your text editor (VSCode is recommended) and start developing your visual novel.

Into all templates there is a `README.md` file with more information about the project.

## Package Installation

For installing the Pixi’VN package, you can use the following command:

```bash
# npm
npm install @drincs/pixi-vn

# yarn
yarn add @drincs/pixi-vn

# pnpm
pnpm add @drincs/pixi-vn

# bun
bun add @drincs/pixi-vn
```

## Usage

For the following example, we will use React to create the interface and Pixi'VN to manage the visual novel.

```tsx
// main.tsx

import { GameWindowManager } from '@drincs/pixi-vn'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Canvas setup with PIXI
const body = document.body
if (!body) {
    throw new Error('body element not found')
}

GameWindowManager.initialize(body, 1920, 1080, {
    backgroundColor: "#303030"
}).then(() => {
    // React setup with ReactDOM
    const root = document.getElementById('root')
    if (!root) {
        throw new Error('root element not found')
    }

    GameWindowManager.initializeHTMLLayout(root)
    const reactRoot = createRoot(GameWindowManager.htmlLayout)

    reactRoot.render(
        <App />
    )
})
```

This is the HTML file that will be used to load the application.

```html
<!-- index.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/pixiVN.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pixi'VN</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

```css
/* index.css */
:root {
  background-color: #242424;
}

body {
  margin: 0;
  display: flex;
}
```
