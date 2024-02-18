import { Application, IApplicationOptions } from "pixi.js";

/**
 * https://www.pixijselementals.com/#letterbox-scale
 */
export class Manager {
    private constructor() { }

    static app: Application;
    static interfaceDiv: HTMLElement;
    // private static currentScene: IScene;
    static width: number;
    static height: number;

    public static initialize(width: number, height: number, options?: Partial<IApplicationOptions>): void {
        Manager.width = width;
        Manager.height = height;
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
        window.addEventListener("resize", Manager.resize);

        // call it manually once so we are sure we are the correct size after starting
        Manager.resize();
    }

    public static get getScreenScale() {
        let screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        let screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        return Math.min(screenWidth / Manager.width, screenHeight / Manager.height);
    }

    public static get getEnlargedWidth() {
        return Math.floor(Manager.getScreenScale * Manager.width);
    }

    public static get getEnlargedHeight() {
        return Math.floor(Manager.getScreenScale * Manager.height);
    }

    public static get getHorizontalMargin() {
        let screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        return (screenWidth - Manager.getEnlargedWidth) / 2;
    }

    public static get getVerticalMargin() {
        let screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        return (screenHeight - Manager.getEnlargedHeight) / 2;
    }

    public static resize(): void {
        // now we use css trickery to set the sizes and margins
        if (!Manager.app?.view?.style) {
            console.error("Manager.app.view.style is undefined");
        }
        else {
            let style = Manager.app.view.style;
            style.width = `${Manager.getEnlargedWidth}px`;
            style.height = `${Manager.getEnlargedHeight}px`;
            (style as any).marginLeft = `${Manager.getHorizontalMargin}px`;
            (style as any).marginRight = `${Manager.getHorizontalMargin}px`;
            (style as any).marginTop = `${Manager.getVerticalMargin}px`;
            (style as any).marginBottom = `${Manager.getVerticalMargin}px`;
        }

        if (!Manager.interfaceDiv) {
            console.error("Manager.app.view.style is undefined");
        }
        else {
            Manager.interfaceDiv.style.width = `${Manager.getEnlargedWidth}px`;
            Manager.interfaceDiv.style.height = `${Manager.getEnlargedHeight}px`;
            Manager.interfaceDiv.style.marginLeft = `${Manager.getHorizontalMargin}px`;
            Manager.interfaceDiv.style.marginRight = `${Manager.getHorizontalMargin}px`;
            Manager.interfaceDiv.style.marginTop = `${Manager.getVerticalMargin}px`;
            Manager.interfaceDiv.style.marginBottom = `${Manager.getVerticalMargin}px`;
        }

    }

    /* More code of your Manager.ts like `changeScene` and `update`*/
}
