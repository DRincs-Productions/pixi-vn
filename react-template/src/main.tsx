import { GameWindowManager } from '@drincs/pixi-vn'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Canvas setup with PIXI
const body = document.body
if (!body) {
    throw new Error('body element not found')
}

await GameWindowManager.initialize(body, 1920, 1080, {
    backgroundColor: "#303030"
})

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
