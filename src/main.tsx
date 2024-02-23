import * as PIXI from 'pixi.js'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { GameWindowManager } from './lib/WindowManager'

// Canvas setup with PIXI
const body = document.body
if (!body) {
    throw new Error('body element not found')
}

GameWindowManager.initialize(1920, 1080, {
    backgroundColor: "#303030"
})

GameWindowManager.addCanvasIntoElement(body)

// React setup with ReactDOM
const root = document.getElementById('root')
if (!root) {
    throw new Error('root element not found')
}

GameWindowManager.addInterfaceIntoElement(root)
const reactRoot = createRoot(GameWindowManager.interfaceDiv)

reactRoot.render(
    <App />
)

const container = new PIXI.Container()
container.x = 0
container.y = 0
GameWindowManager.app.stage.addChild(container)
