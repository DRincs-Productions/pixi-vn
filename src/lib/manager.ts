import { Application, ColorSource } from "pixi.js";

/**
 * https://www.pixijselementals.com/#letterbox-scale
 */
export class Manager {
    private constructor() { }

    static app: Application;
    // private static currentScene: IScene;

    private static _width: number;
    private static _height: number;


    public static get width(): number {
        return Manager._width;
    }
    public static get height(): number {
        return Manager._height;
    }


    public static initialize(width: number, height: number, background: ColorSource): void {

        Manager._width = width;
        Manager._height = height;

        Manager.app = new Application({
            // view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            backgroundColor: background,
            width: width,
            height: height
        });

        // Manager.app.ticker.add(Manager.update)

        // listen for the browser telling us that the screen size changed
        window.addEventListener("resize", Manager.resize);

        // call it manually once so we are sure we are the correct size after starting
        Manager.resize();
    }

    public static getScreenScale() {
        const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        return Math.min(screenWidth / Manager.width, screenHeight / Manager.height);
    }

    public static getEnlargedWidth() {
        return Math.floor(Manager.getScreenScale() * Manager.width);
    }

    public static getEnlargedHeight() {
        return Math.floor(Manager.getScreenScale() * Manager.height);
    }

    public static getHorizontalMargin() {
        const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        return (screenWidth - Manager.getEnlargedWidth()) / 2;
    }

    public static getVerticalMargin() {
        const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        return (screenHeight - Manager.getEnlargedHeight()) / 2;
    }

    public static resize(): void {
        // now we use css trickery to set the sizes and margins
        if (!Manager.app.view.style) {
            console.error("Manager.app.view.style is undefined");
            return
        }
        let style = Manager.app.view.style;
        style.width = `${Manager.getEnlargedWidth()}px`;
        style.height = `${Manager.getEnlargedHeight()}px`;
        (style as any).marginLeft = `${Manager.getHorizontalMargin()}px`;
        (style as any).marginRight = `${Manager.getHorizontalMargin()}px`;
        (style as any).marginTop = `${Manager.getVerticalMargin()}px`;
        (style as any).marginBottom = `${Manager.getVerticalMargin()}px`;

    }

    /* More code of your Manager.ts like `changeScene` and `update`*/
}
