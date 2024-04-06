# Pixi'VN - Pixi Visual Novel Engine

Pixi'VN is a npm package that provides various features for creating visual novels.

Pixi'VN has functions to manage story steps, saving and loading, variable storage, dialogues, and character creation.

Pixi'VN is based on [Pixi.js](https://pixijs.com/), a modern 2D rendering engine, expanding the features by adding a save and load system, and functions to simplify the addition of images and animations.

In addition to managing the Pixi.js "Canvas", Pixi'VN offers the possibility of adding an HTML Element with the same dimensions as the "Canvas" to add interactions with the user.
This allows the use of systems such as React, Vue, Angular, etc. to create much more complex interfaces with excellent performance.

## Get Started

### Installation

```bash
npm install @drincs/pixi-vn
```

### Usage

For the following example, we will use React to create the interface and Pixi'VN to manage the visual novel.

```typescript
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

## Wiki

For more information, visit the [Wiki](https://pixivn.readthedocs.io/)

## Why Pixi'VN?

The reason why Pixi'VN was born is that current systems for creating a visual novel are based on dated systems and have many shortcomings.
