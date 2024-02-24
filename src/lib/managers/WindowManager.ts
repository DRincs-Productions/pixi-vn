import { Application, DisplayObject, IApplicationOptions } from "pixi.js";

/**
 * This class is responsible for managing the window size and the children of the window.
 * This implementation was followed: https://www.pixijselementals.com/#letterbox-scale
 */
export class GameWindowManager {
    private constructor() { }

    static app: Application
    static interfaceDiv: HTMLElement
    // private static currentScene: IScene
    static width: number
    static height: number

    public static initialize(width: number, height: number, options?: Partial<IApplicationOptions>): void {
        GameWindowManager.width = width
        GameWindowManager.height = height
        GameWindowManager.app = new Application({
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            width: width,
            height: height,
            ...options
        });

        let div = document.createElement('div')
        div.style.position = 'absolute'
        GameWindowManager.interfaceDiv = div

        // Manager.app.ticker.add(Manager.update)

        // listen for the browser telling us that the screen size changed
        window.addEventListener("resize", GameWindowManager.resize)

        // call it manually once so we are sure we are the correct size after starting
        GameWindowManager.resize()
    }

    public static addCanvasIntoElement(element: HTMLElement) {
        element.appendChild(GameWindowManager.app.view as HTMLCanvasElement)
    }

    public static addInterfaceIntoElement(element: HTMLElement) {
        element.appendChild(GameWindowManager.interfaceDiv)
    }

    /* Resize Metods */

    public static get screenScale() {
        let screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
        let screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
        return Math.min(screenWidth / GameWindowManager.width, screenHeight / GameWindowManager.height)
    }

    public static get enlargedWidth() {
        return Math.floor(GameWindowManager.screenScale * GameWindowManager.width)
    }

    public static get enlargedHeight() {
        return Math.floor(GameWindowManager.screenScale * GameWindowManager.height)
    }

    public static get horizontalMargin() {
        let screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
        return (screenWidth - GameWindowManager.enlargedWidth) / 2
    }

    public static get verticalMargin() {
        let screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
        return (screenHeight - GameWindowManager.enlargedHeight) / 2
    }

    public static resize(): void {
        // now we use css trickery to set the sizes and margins
        if (!GameWindowManager.app?.view?.style) {
            console.error("Manager.app.view.style is undefined")
        }
        else {
            let style = GameWindowManager.app.view.style;
            style.width = `${GameWindowManager.enlargedWidth}px`;
            style.height = `${GameWindowManager.enlargedHeight}px`;
            (style as any).marginLeft = `${GameWindowManager.horizontalMargin}px`;
            (style as any).marginRight = `${GameWindowManager.horizontalMargin}px`;
            (style as any).marginTop = `${GameWindowManager.verticalMargin}px`;
            (style as any).marginBottom = `${GameWindowManager.verticalMargin}px`;
        }

        if (!GameWindowManager.interfaceDiv) {
            console.error("Manager.interfaceDiv is undefined")
        }
        else {
            GameWindowManager.interfaceDiv.style.width = `${GameWindowManager.enlargedWidth}px`
            GameWindowManager.interfaceDiv.style.height = `${GameWindowManager.enlargedHeight}px`
            GameWindowManager.interfaceDiv.style.marginLeft = `${GameWindowManager.horizontalMargin}px`
            GameWindowManager.interfaceDiv.style.marginRight = `${GameWindowManager.horizontalMargin}px`
            GameWindowManager.interfaceDiv.style.marginTop = `${GameWindowManager.verticalMargin}px`
            GameWindowManager.interfaceDiv.style.marginBottom = `${GameWindowManager.verticalMargin}px`
        }

    }

    /* Edit Children Methods */
    private static children: { [tag: string]: DisplayObject } = {}

    public static addChild(tag: string, child: DisplayObject) {
        if (GameWindowManager.children[tag]) {
            GameWindowManager.removeChild(tag)
        }
        GameWindowManager.app.stage.addChild(child)
        GameWindowManager.children[tag] = child
    }

    public static removeChild(tag: string) {
        if (!GameWindowManager.children[tag]) {
            console.error("Child with tag not found")
            return
        }
        GameWindowManager.app.stage.removeChild(GameWindowManager.children[tag])
        delete GameWindowManager.children[tag]
    }

    public static getChild(tag: string) {
        return GameWindowManager.children[tag]
    }

    public static removeChildren() {
        GameWindowManager.app.stage.removeChildren()
        GameWindowManager.children = {}
    }
}
