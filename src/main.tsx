import * as PIXI from 'pixi.js';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { showImage } from './lib/image';
import { Manager } from './lib/manager';

// Canvas setup with PIXI
const body = document.body
if (!body) {
    throw new Error('body element not found')
}

Manager.initialize(1920, 1080, {
    backgroundColor: 0x1099bb
})

Manager.addCanvasIntoElement(body)

// React setup with ReactDOM
const root = document.getElementById('root')
if (!root) {
    throw new Error('root element not found')
}

Manager.addInterfaceIntoElement(root)
const reactRoot = createRoot(Manager.interfaceDiv)

reactRoot.render(
    <App />
)

const container = new PIXI.Container()
container.x = 0
container.y = 0
Manager.app.stage.addChild(container)

showImage("grass", 'https://pixijs.com/assets/bg_grass.jpg')
