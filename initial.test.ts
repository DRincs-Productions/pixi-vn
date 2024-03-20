import { expect, test } from 'vitest';
import { GameWindowManager } from './src';

test('aaaa', async () => {
    try {
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
        let res = GameWindowManager.isInitialized || GameWindowManager.htmlLayout
        expect(res).toBe(true)
    }
    catch (e) {
        console.error(e)
        expect(false).toBe(true)
    }
});
