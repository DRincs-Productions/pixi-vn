import * as PIXI from 'pixi.js';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { showImage } from './lib/image';
import { Manager } from './lib/manager';

// Canvas setup with PIXI
const canvas = document.body
if (!canvas) {
    throw new Error('body element not found');
}

Manager.initialize(1920, 1080, '#1099bb')

canvas.appendChild(Manager.app.view as HTMLCanvasElement)

// React setup with ReactDOM
const reactRoot = document.getElementById('root')
if (!reactRoot) {
    throw new Error('root element not found');
}

const root = createRoot(reactRoot);
root.render(
    <App />
)

const container = new PIXI.Container();
container.x = 0;
container.y = 0;
Manager.app.stage.addChild(container);

showImage('https://pixijs.com/assets/bg_grass.jpg', container)
