# Pixi’VN - PixiJS Game Engine

![pixi-vn-cover](https://github.com/user-attachments/assets/28c41fe1-c539-4ebb-b7d4-8cb9f79e089e)

Pixi’VN is a very versatile and powerful visual novel/2D game engine. It is based on JavaScript/TypeScript and uses the [Pixi.js](https://pixijs.com/) library for rendering.

Its great versatility is due to the fact that Pixi’VN is a npm package, that provides various core features to manage story steps, dialogues, character, canvas, variable storage, saving and loading, and much more. This means that it can be used both to create visual novels and to create other types of 2D games (such as Point and Click Adventure Games, RPGs, etc...), with your favorite JavaScript framework (React, Vue, Angular, etc...).

Pixi’VN provides the ability to use [Templates](#project-initialization) to get started quickly. Less experienced developers can use these templates to create a visual novel without much knowledge of JavaScript/TypeScript.

With the [PixiVNJson](https://pixi-vn.web.app/other-topics/pixi-vn-json) implementation you have the option to use various types of narrative languages ​​(in addition to JavaScript/TypeScript). Currently you can use the following:

* [*ink*](https://pixi-vn.web.app/ink/ink)
* [Ren'Py](https://pixi-vn.web.app/renpy/renpy)

Pixi’VN offers the possibility of adding an HTML Element with the same dimensions as the [PixiJS Canvas](https://pixi-vn.web.app/start/canvas) to add an **UI** with JavaScript frameworks.

By "UI" is meant the elements that are above the canvas, such as buttons, forms, etc.

![Frame_Aufbau](https://firebasestorage.googleapis.com/v0/b/pixi-vn.appspot.com/o/public%2FPixiVN_interface.png?alt=media)

This allows the use of systems such as React, Vue, Angular, etc. to create much more complex **UI screens** with excellent performance.

* [Angular](https://pixi-vn.web.app/start/interface-angular)
* [React Interface](https://pixi-vn.web.app/start/interface-react)
* [Vue](https://pixi-vn.web.app/start/interface-vue)

## Wiki

* [Why Pixi’VN?](https://pixi-vn.web.app/start/why)
* [Get Started](https://pixi-vn.web.app/start/getting-started)
* Make your first:
  * [Visual Novel](https://pixi-vn.web.app/start/make-visual-novel)
  * [Point and Click adventure game](https://pixi-vn.web.app/start/make-point-and-click)
  * [RPG game](https://pixi-vn.web.app/start/make-rpg)

## First steps

* [Characters](https://pixi-vn.web.app/start/character)
* [Narration](https://pixi-vn.web.app/start/narration):
  * [Narration with ink](https://pixi-vn.web.app/ink/ink):
    * [Characters](https://pixi-vn.web.app/ink/ink-character)
    * [Open a knot](https://pixi-vn.web.app/ink/ink-label)
    * [Variables](https://pixi-vn.web.app/ink/ink-variables)
    * [Markup language (to add text style)](https://pixi-vn.web.app/ink/ink-markup)
    * [Input](https://pixi-vn.web.app/ink/ink-input)
    * [Canvas](https://pixi-vn.web.app/ink/ink-canvas)
    * [Sounds and Music](https://pixi-vn.web.app/ink/ink-sound)
    * [Assets management](https://pixi-vn.web.app/ink/ink-assets)
    * [Pause](https://pixi-vn.web.app/ink/ink-pause)
    * [Text replacement](https://pixi-vn.web.app/ink/ink-replacement)
    * [Translating](https://pixi-vn.web.app/ink/ink-translate)
    * [Custom Hashtag Script](https://pixi-vn.web.app/ink/ink-hashtag)
  * [Narration with Ren’Py](https://pixi-vn.web.app/renpy/renpy)
  * Narration with JS/TS:
    * [Dialogue](https://pixi-vn.web.app/start/dialogue)
    * [Label and Game Step](https://pixi-vn.web.app/start/labels)
      * [Game flow with labels](https://pixi-vn.web.app/start/labels-flow)
      * [Label features](https://pixi-vn.web.app/start/labels-advanced)
    * [Choice Menus](https://pixi-vn.web.app/start/choices)
    * [Input](https://pixi-vn.web.app/start/input)
    * [History](https://pixi-vn.web.app/start/history)
    * [Translating](https://pixi-vn.web.app/start/translate)
    * [Markup language (to add text style)](https://pixi-vn.web.app/start/markup)
      * [Markdown](https://pixi-vn.web.app/start/markup-markdown)
      * [Typewriter effect](https://pixi-vn.web.app/start/markup-typewriter)
    * [Other features](https://pixi-vn.web.app/start/other-narrative-features)
* [PixiJS Canvas](https://pixi-vn.web.app/start/canvas):
  * [Initialize the canvas](https://pixi-vn.web.app/start/canvas-initialize)
  * [Canvas alias](https://pixi-vn.web.app/start/canvas-alias)
  * [Canvas Components](https://pixi-vn.web.app/start/canvas-components)
    * [ImageSprite](https://pixi-vn.web.app/start/canvas-images)
    * [ImageContainer](https://pixi-vn.web.app/start/canvas-image-container)
    * [VideoSprite](https://pixi-vn.web.app/start/canvas-videos)
    * [Filters](https://pixi-vn.web.app/start/canvas-filters)
    * [Lights](https://pixi-vn.web.app/start/canvas-lights)
    * [Spine 2D](https://pixi-vn.web.app/start/canvas-spine2d)
  * [Canvas functions](https://pixi-vn.web.app/start/canvas-functions)
  * [Position properties](https://pixi-vn.web.app/start/canvas-position)
  * [Transitions](https://pixi-vn.web.app/start/canvas-transition)
  * [Animations and Effects](https://pixi-vn.web.app/start/canvas-animations-effects)
    * [Primitives (ticker)](https://pixi-vn.web.app/start/canvas-tickers)
      * [Tickers methods](https://pixi-vn.web.app/start/canvas-tickers-functions)
    * [Articulated](https://pixi-vn.web.app/start/canvas-articulated-animations-effects)
* [Sounds and Music](https://pixi-vn.web.app/start/sound)
* [Assets](https://pixi-vn.web.app/start/assets)
  * [Assets management](https://pixi-vn.web.app/start/assets-management)
* [Game storage](https://pixi-vn.web.app/start/storage):
  * [Flags Management](https://pixi-vn.web.app/start/flags)
  * [Stored Classes](https://pixi-vn.web.app/start/stored-classes)
* [UI with JavaScript Framework](https://pixi-vn.web.app/start/interface)
  * JavaScript Frameworks
    * [Angular UI](https://pixi-vn.web.app/start/interface-angular)
    * [React UI](https://pixi-vn.web.app/start/interface-react)
    * [Vue UI](https://pixi-vn.web.app/start/interface-vue)
  * [Navigate/switch between UI screens](https://pixi-vn.web.app/start/interface-navigate)
  * [Connect the UI with the storage](https://pixi-vn.web.app/start/interface-connect-storage)
* [Save and Load](https://pixi-vn.web.app/start/save)
* [Distribution](https://pixi-vn.web.app/start/distribution)
  * [Website distribution](https://pixi-vn.web.app/start/distribution-website)
  * [Desktop & mobile devices](https://pixi-vn.web.app/start/distribution-desktop-mobile)

## Other topics

* [FAQ](https://pixi-vn.web.app/other-topics/faq)
* [Intecept Events](https://pixi-vn.web.app/other-topics/intercept-events)
* [Pixi’VN + Json](https://pixi-vn.web.app/other-topics/pixi-vn-json)

## Prerequisites

Before starting, you must have the following tools installed:

* [Node.js](https://nodejs.org/) version 18 or higher.
* Text Editor with TypeScript support.
  * [Visual Studio Code](https://code.visualstudio.com/)
  * [Cursor](https://www.cursor.com/)
  * [VSCodium](https://vscodium.com/)
* (Recommended) [Git](https://git-scm.com/)
  * Have a [GitHub account](https://github.com/)

## Project Initialization

If you want to start a new project, you can use the following command to initialize a new project with the Pixi’VN template:

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

The supported template presets are:

**Visual Novel - React**:

* **[Visual Novel - React - Typescript - Web page](https://github.com/DRincs-Productions/pixi-vn-react-template)**
* **[Visual Novel - React - Typescript - Web page + Desktop + Mobile](https://github.com/DRincs-Productions/pixi-vn-react-template/tree/tauri)**
* **[Visual Novel - React - Ink + Typescript - Web page](https://github.com/DRincs-Productions/pixi-vn-react-template/tree/ink)**
* **[Visual Novel - React - Ink + Typescript - Web page + Desktop + Mobile](https://github.com/DRincs-Productions/pixi-vn-react-template/tree/ink-tauri)**

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

canvas.initialize(body, {
    height: 1080,
    width: 1920,
    backgroundColor: "#303030"
})

// read more here: https://pixi-vn.web.app/start/other-narrative-features.html#how-manage-the-end-of-the-game
narration.onGameEnd = async (props) => {
    clearAllGameDatas()
    props.navigate("/")
}
```
