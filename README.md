# Pixi'VN - PixiJS Visual Novel Engine

![pixi-vn-cover](https://github.com/user-attachments/assets/28c41fe1-c539-4ebb-b7d4-8cb9f79e089e)

Pixi’VN is a npm package that provides various features for creating visual novels, has functions to manage story steps, saving and loading, variable storage, dialogues, character,canvas management, and much more.

Pixi’VN + [Templates](#project-initialization) provides a complete solution and is in effect a visual novel engine.

It is designed for web developers, with basic experience in JavaScript/TypeScript, who want to create a visual novel with a modern 2D rendering engine and their favorite JavaScript framework.

With the [PixiVNJson](https://pixi-vn.web.app/advanced/pixi-vn-json.html) implementation you have the option to use various types of narrative languages ​​(in addition to JavaScript/TypeScript). Currently you can use the following:

* [Ink](https://pixi-vn.web.app/ink/ink.html)
* [Ren'Py](https://pixi-vn.web.app/renpy/renpy.html)

It is based on [Pixi.js](https://pixijs.com/), a rendering engine that allows you to create fast 2D graphics. It is based on WebGL and is very fast and efficient. It is used by many developers to create games, websites, and applications.

Pixi’VN offers the possibility of adding an HTML Element with the same dimensions as the [PixiJS Canvas](https://pixi-vn.web.app/start/canvas.html) to add an **UI** with JavaScript frameworks.

By "UI" is meant the elements that are above the canvas, such as buttons, forms, etc.

![Frame_Aufbau](https://github.com/user-attachments/assets/54adca3e-7f5a-4886-a52a-d499d2cca6b3)

This allows the use of systems such as React, Vue, Angular, etc. to create much more complex **UI screens** with excellent performance.

* [Angular](https://pixi-vn.web.app/start/interface-angular.html)
* [React Interface](https://pixi-vn.web.app/start/interface-react.html)
* [Vue](https://pixi-vn.web.app/start/interface-vue.html)

## Wiki

For more information, visit the [Web Page](https://pixi-vn.web.app/)

* [Why Pixi’VN?](https://pixi-vn.web.app/start/why.html)
* [Get Started](https://pixi-vn.web.app/start/getting-started.html)

### First steps

* [Characters](https://pixi-vn.web.app/start/character.html)
* [Narration (JS/TS)](https://pixi-vn.web.app/start/narration.html):
  * [Dialogue](https://pixi-vn.web.app/start/dialogue.html)
  * [Label and Game Step](https://pixi-vn.web.app/start/labels.html)
  * [Choice Menus](https://pixi-vn.web.app/start/choices.html)
  * [Input](https://pixi-vn.web.app/start/input.html)
  * [History](https://pixi-vn.web.app/start/history.html)
  * [Translating](https://pixi-vn.web.app/start/translate.html)
  * [Typewriter effect](https://pixi-vn.web.app/start/typewriter.html)
  * [Style Text (Markdown)](https://pixi-vn.web.app/start/markdown.html)
* [Narration with Ink](https://pixi-vn.web.app/ink/ink.html):
  * [Characters](https://pixi-vn.web.app/ink/ink-character.html)
  * [Style Text (Markdown)](https://pixi-vn.web.app/ink/ink-markdown.html)
  * [Input](https://pixi-vn.web.app/ink/ink-input.html)
  * [Canvas](https://pixi-vn.web.app/ink/ink-canvas.html)
  * [Sounds and Music](https://pixi-vn.web.app/ink/ink-sound.html)
  * [Translating](https://pixi-vn.web.app/ink/ink-translate.html)
* [Narration with Ren’Py](https://pixi-vn.web.app/renpy/renpy.html)
* [PixiJS Canvas](https://pixi-vn.web.app/start/canvas.html):
  * [Images](https://pixi-vn.web.app/start/images.html)
  * [Video](https://pixi-vn.web.app/start/videos.html)
  * [Transitions](https://pixi-vn.web.app/start/transition.html)
  * [Canvas Elements](https://pixi-vn.web.app/start/canvas-elements.html)
  * [Animations and Effects](https://pixi-vn.web.app/start/animations-effects.html)
  * [Tickers](https://pixi-vn.web.app/start/tickers.html)
* [Sounds and Music](https://pixi-vn.web.app/start/sound.html)
* [UI with JavaScript Framework](https://pixi-vn.web.app/start/interface.html)
  * [Angular UI](https://pixi-vn.web.app/start/interface-angular.html)
  * [React UI](https://pixi-vn.web.app/start/interface-react.html)
  * [Vue UI](https://pixi-vn.web.app/start/interface-vue.html)
* [Game storage](https://pixi-vn.web.app/start/storage.html):
  * [Flags Management](https://pixi-vn.web.app/start/flags.html)
  * [Stored Classes](https://pixi-vn.web.app/start/stored-classes.html)
* [Save and Load](https://pixi-vn.web.app/start/save.html)

### Advanced topics

* [Intecept Events](https://pixi-vn.web.app/advanced/intercept-events.html)
* [Distribution](https://pixi-vn.web.app/advanced/distribution.html)
  * [Mobile distribution](https://pixi-vn.web.app/advanced/distribution%E2%80%90mobile.html)
* [Pixi’VN + Json](https://pixi-vn.web.app/advanced/pixi-vn-json.html)

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

* **[Basic Visual Novel - Web page (Vite + React + MUI joy)](https://github.com/DRincs-Productions/pixi-vn-react-template)**
* **[Basic Visual Novel - Multi Device (Vite + React + MUI joy + Electron Forge)](https://github.com/DRincs-Productions/pixi-vn-react-template/tree/electron)**

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

Now you must initialize the Pixi’VN window before using the engine.

For example, you add the following code to the `main.ts` or `index.ts` (It depends on your project configuration):

```typescript
import { canvas, narration, clearAllGameDatas } from '@drincs/pixi-vn'
import App from './App'
import './index.css'

// Canvas setup with PIXI
const body = document.body
if (!body) {
    throw new Error('body element not found')
}

canvas.initialize(body, 1920, 1080, {
    backgroundColor: "#303030"
})

// read more here: https://pixi-vn.web.app/start/labels.html#how-manage-the-end-of-the-game
narration.onGameEnd = async (props) => {
    clearAllGameDatas()
    props.navigate("/")
}
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
    <title>Pixi’VN</title>
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
