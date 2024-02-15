import * as PIXI from 'pixi.js';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { showImage } from './lib/image.ts';

// Canvas setup with PIXI
const canvas = document.body
if (!canvas) {
    throw new Error('body element not found');
}

const app = new PIXI.Application({
    background: '#1099bb',
    resizeTo: window,
});

canvas.appendChild(app.view as HTMLCanvasElement);

// React setup with ReactDOM
const reactRoot = document.getElementById('root')
if (!reactRoot) {
    throw new Error('root element not found');
}

const container = new PIXI.Container();
container.x = 0;
container.y = 0;
app.stage.addChild(container);


ReactDOM.createRoot(reactRoot).render(
    <App />
)

await showImage('https://pixijs.com/assets/bg_grass.jpg', container)
