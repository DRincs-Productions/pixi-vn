# Pixi’VN - PixiJS Visual Novel Engine

![pixi-vn-cover](https://github.com/user-attachments/assets/28c41fe1-c539-4ebb-b7d4-8cb9f79e089e)

Pixi’VN is a very versatile and powerful visual novel/2D game engine. It is based on JavaScript/TypeScript and uses the [Pixi.js](https://pixijs.com/) library for rendering.

Its great versatility is due to the fact that Pixi’VN is a npm package, that provides various core features to manage story steps, dialogues, character, canvas management, variable storage, saving and loading, and much more. This means that it can be used both to create visual novels and to create other types of 2D games (such as Point and Click Adventure Games, RPGs, etc...), with your favorite JavaScript framework (React, Vue, Angular, etc...).

Pixi’VN provides the ability to use [Templates](#project-initialization) to get started quickly. Less experienced developers can use these templates to create a visual novel without much knowledge of JavaScript/TypeScript.

With the [PixiVNJson](https://pixi-vn.web.app/advanced/pixi-vn-json.html) implementation you have the option to use various types of narrative languages ​​(in addition to JavaScript/TypeScript). Currently you can use the following:

* [*ink*](https://pixi-vn.web.app/ink/ink.html)
* [Ren'Py](https://pixi-vn.web.app/renpy/renpy.html)

Pixi’VN offers the possibility of adding an HTML Element with the same dimensions as the [PixiJS Canvas](https://pixi-vn.web.app/start/canvas.html) to add an **UI** with JavaScript frameworks.

By "UI" is meant the elements that are above the canvas, such as buttons, forms, etc.

![Frame_Aufbau](https://github.com/user-attachments/assets/54adca3e-7f5a-4886-a52a-d499d2cca6b3)

This allows the use of systems such as React, Vue, Angular, etc. to create much more complex **UI screens** with excellent performance.

* [Angular](https://pixi-vn.web.app/start/interface-angular.html)
* [React Interface](https://pixi-vn.web.app/start/interface-react.html)
* [Vue](https://pixi-vn.web.app/start/interface-vue.html)

## Wiki

* [Why Pixi’VN?](https://pixi-vn.web.app/start/why.html)
* [Get Started](https://pixi-vn.web.app/start/getting-started.html)
* Make your first:
  * [Visual Novel](https://pixi-vn.web.app/start/make-visual-novel.html)
  * [Point and Click adventure game](https://pixi-vn.web.app/start/make-point-and-click.html)
  * [RPG game](https://pixi-vn.web.app/start/make-rpg.html)

## First steps

* [Characters](https://pixi-vn.web.app/start/character.html)
* [Narration](https://pixi-vn.web.app/start/narration.html):
  * [Narration with ink](https://pixi-vn.web.app/ink/ink.html):
    * [Characters](https://pixi-vn.web.app/ink/ink-character.html)
    * [Open a knot](https://pixi-vn.web.app/ink/ink-label.html)
    * [Variables](https://pixi-vn.web.app/ink/ink-variables.html)
    * [Markup language (to add text style)](https://pixi-vn.web.app/ink/ink-markup.html)
    * [Input](https://pixi-vn.web.app/ink/ink-input.html)
    * [Canvas](https://pixi-vn.web.app/ink/ink-canvas.html)
    * [Sounds and Music](https://pixi-vn.web.app/ink/ink-sound.html)
    * [Assets management](https://pixi-vn.web.app/ink/ink-assets.html)
    * [Pause](https://pixi-vn.web.app/ink/ink-pause.html)
    * [Text replacement](https://pixi-vn.web.app/ink/ink-replacement.html)
    * [Translating](https://pixi-vn.web.app/ink/ink-translate.html)
    * [Custom Hashtag Script](https://pixi-vn.web.app/ink/ink-hashtag.html)
  * [Narration with Ren’Py](https://pixi-vn.web.app/renpy/renpy.html)
  * Narration with JS/TS:
    * [Dialogue](https://pixi-vn.web.app/start/dialogue.html)
    * [Label and Game Step](https://pixi-vn.web.app/start/labels.html)
      * [Game flow with labels](https://pixi-vn.web.app/start/labels-flow.html)
      * [Label features](https://pixi-vn.web.app/start/labels-advanced.html)
    * [Choice Menus](https://pixi-vn.web.app/start/choices.html)
    * [Input](https://pixi-vn.web.app/start/input.html)
    * [History](https://pixi-vn.web.app/start/history.html)
    * [Translating](https://pixi-vn.web.app/start/translate.html)
    * [Markup language (to add text style)](https://pixi-vn.web.app/start/markup.html)
      * [Markdown](https://pixi-vn.web.app/start/markup-markdown.html)
      * [Typewriter effect](https://pixi-vn.web.app/start/markup-typewriter.html)
    * [Other features](https://pixi-vn.web.app/start/other-narrative-features.html)
* [PixiJS Canvas](https://pixi-vn.web.app/start/canvas.html):
  * [Initialize the canvas](https://pixi-vn.web.app/start/canvas-initialize.html)
  * [Canvas alias](https://pixi-vn.web.app/start/canvas-alias.html)
  * [Canvas Components](https://pixi-vn.web.app/start/canvas-components.html)
    * [ImageSprite](https://pixi-vn.web.app/start/canvas-images.html)
    * [ImageContainer](https://pixi-vn.web.app/start/canvas-image-container.html)
    * [VideoSprite](https://pixi-vn.web.app/start/canvas-videos.html)
    * [Filters](https://pixi-vn.web.app/start/canvas-filters.html)
    * [Lights](https://pixi-vn.web.app/start/canvas-lights.html)
    * [Spine 2D](https://pixi-vn.web.app/start/canvas-spine2d.html)
  * [Canvas functions](https://pixi-vn.web.app/start/canvas-functions.html)
  * [Position properties](https://pixi-vn.web.app/start/canvas-position.html)
  * [Transitions](https://pixi-vn.web.app/start/canvas-transition.html)
  * [Animations and Effects](https://pixi-vn.web.app/start/canvas-animations-effects.html)
    * [Primitives (ticker)](https://pixi-vn.web.app/start/canvas-tickers.html)
      * [Tickers methods](https://pixi-vn.web.app/start/canvas-tickers-functions.html)
    * [Articulated](https://pixi-vn.web.app/start/canvas-articulated-animations-effects.html)
* [Sounds and Music](https://pixi-vn.web.app/start/sound.html)
* [Assets](https://pixi-vn.web.app/start/assets.html)
  * [Assets management](https://pixi-vn.web.app/start/assets-management.html)
* [Game storage](https://pixi-vn.web.app/start/storage.html):
  * [Flags Management](https://pixi-vn.web.app/start/flags.html)
  * [Stored Classes](https://pixi-vn.web.app/start/stored-classes.html)
* [UI with JavaScript Framework](https://pixi-vn.web.app/start/interface.html)
  * JavaScript Frameworks
    * [Angular UI](https://pixi-vn.web.app/start/interface-angular.html)
    * [React UI](https://pixi-vn.web.app/start/interface-react.html)
    * [Vue UI](https://pixi-vn.web.app/start/interface-vue.html)
  * [Navigate/switch between UI screens](https://pixi-vn.web.app/start/interface-navigate.html)
  * [Connect the UI with the storage](https://pixi-vn.web.app/start/interface-connect-storage.html)
* [Save and Load](https://pixi-vn.web.app/start/save.html)

## Advanced topics

* [Intecept Events](https://pixi-vn.web.app/advanced/intercept-events.html)
* [Distribution](https://pixi-vn.web.app/advanced/distribution.html)
  * [Website distribution](https://pixi-vn.web.app/advanced/distribution-website.html)
  * [Desktop & mobile devices](https://pixi-vn.web.app/advanced/distribution-desktop-mobile.html)
* [Pixi’VN + Json](https://pixi-vn.web.app/advanced/pixi-vn-json.html)

## Prerequisites

Before starting, you must have the following tools installed:

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

// read more here: https://pixi-vn.web.app/start/other-narrative-features.html#how-manage-the-end-of-the-game
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
