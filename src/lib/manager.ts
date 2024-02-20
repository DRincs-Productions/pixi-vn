import { Application, DisplayObject, IApplicationOptions } from "pixi.js";

/**
 * https://www.pixijselementals.com/#letterbox-scale
 */
export class Manager {
    private constructor() { }

    static app: Application
    static interfaceDiv: HTMLElement
    // private static currentScene: IScene
    static width: number
    static height: number

    public static initialize(width: number, height: number, options?: Partial<IApplicationOptions>): void {
        Manager.width = width
        Manager.height = height
        Manager.app = new Application({
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            width: width,
            height: height,
            ...options
        });

        let div = document.createElement('div')
        div.style.position = 'absolute'
        Manager.interfaceDiv = div

        // Manager.app.ticker.add(Manager.update)

        // listen for the browser telling us that the screen size changed
        window.addEventListener("resize", Manager.resize)

        // call it manually once so we are sure we are the correct size after starting
        Manager.resize()
    }

    public static addCanvasIntoElement(element: HTMLElement) {
        element.appendChild(Manager.app.view as HTMLCanvasElement)
    }

    public static addInterfaceIntoElement(element: HTMLElement) {
        element.appendChild(Manager.interfaceDiv)
    }

    /* Resize Metods */

    public static get screenScale() {
        let screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
        let screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
        return Math.min(screenWidth / Manager.width, screenHeight / Manager.height)
    }

    public static get enlargedWidth() {
        return Math.floor(Manager.screenScale * Manager.width)
    }

    public static get enlargedHeight() {
        return Math.floor(Manager.screenScale * Manager.height)
    }

    public static get horizontalMargin() {
        let screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
        return (screenWidth - Manager.enlargedWidth) / 2
    }

    public static get verticalMargin() {
        let screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
        return (screenHeight - Manager.enlargedHeight) / 2
    }

    public static resize(): void {
        // now we use css trickery to set the sizes and margins
        if (!Manager.app?.view?.style) {
            console.error("Manager.app.view.style is undefined")
        }
        else {
            let style = Manager.app.view.style;
            style.width = `${Manager.enlargedWidth}px`;
            style.height = `${Manager.enlargedHeight}px`;
            (style as any).marginLeft = `${Manager.horizontalMargin}px`;
            (style as any).marginRight = `${Manager.horizontalMargin}px`;
            (style as any).marginTop = `${Manager.verticalMargin}px`;
            (style as any).marginBottom = `${Manager.verticalMargin}px`;
        }

        if (!Manager.interfaceDiv) {
            console.error("Manager.interfaceDiv is undefined")
        }
        else {
            Manager.interfaceDiv.style.width = `${Manager.enlargedWidth}px`
            Manager.interfaceDiv.style.height = `${Manager.enlargedHeight}px`
            Manager.interfaceDiv.style.marginLeft = `${Manager.horizontalMargin}px`
            Manager.interfaceDiv.style.marginRight = `${Manager.horizontalMargin}px`
            Manager.interfaceDiv.style.marginTop = `${Manager.verticalMargin}px`
            Manager.interfaceDiv.style.marginBottom = `${Manager.verticalMargin}px`
        }

    }

    /* Edit Children Methods */
    private static children: { [id: string]: DisplayObject } = {}

    public static addChild(id: string, child: DisplayObject) {
        if (Manager.children[id]) {
            Manager.removeChild(id)
        }
        Manager.app.stage.addChild(child)
        Manager.children[id] = child
    }

    public static removeChild(id: string) {
        if (!Manager.children[id]) {
            console.error("Child with id not found")
            return
        }
        Manager.app.stage.removeChild(Manager.children[id])
        delete Manager.children[id]
    }

    public static getChild(id: string) {
        return Manager.children[id]
    }

    removeChildren() {
        Manager.app.stage.removeChildren()
        Manager.children = {}
    }
}
