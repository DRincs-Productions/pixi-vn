import CanvasBase from "../classes/canvas/CanvasBase";
import { geTickerInstanceById } from "../decorators/TickerDecorator";
import { createExportableElement } from "../functions/ExportUtility";
import { exportCanvasElement, importCanvasElement } from '../functions/canvas/CanvasMemoryUtility';
import { ICanvasBaseMemory } from "../interface/canvas";
import { ExportedCanvas } from "../interface/export";

export default class GameSoundManager {
    private constructor() { }

    static get currentCanvasElements() {
        return GameSoundManager._children
    }
    private static _children: { [tag: string]: CanvasBase<any> } = {}
    private static childrenTagsOrder: string[] = []
    public static addCanvasElement(tag: string, canvasElement: CanvasBase<any>) {
        if (GameSoundManager._children[tag]) {
            GameSoundManager.removeCanvasElement(tag)
        }
        GameSoundManager.app.stage.addChild(canvasElement)
        GameSoundManager._children[tag] = canvasElement
        GameSoundManager.childrenTagsOrder.push(tag)
    }
    public static removeCanvasElement(tags: string | string[]) {
        if (typeof tags === "string") {
            tags = [tags]
        }
        tags.forEach((tag) => {
            if (GameSoundManager._children[tag]) {
                GameSoundManager.app.stage.removeChild(GameSoundManager._children[tag])
                delete GameSoundManager._children[tag]
            }
        })
        GameSoundManager.childrenTagsOrder = GameSoundManager.childrenTagsOrder.filter((t) => !tags.includes(t))
    }
    public static getCanvasElement<T extends CanvasBase<any>>(tag: string): T | undefined {
        return GameSoundManager._children[tag] as T | undefined
    }
    public static removeCanvasElements() {
        GameSoundManager.app.stage.removeChildren()
        GameSoundManager._children = {}
        GameSoundManager.childrenTagsOrder = []
    }
    public static editCanvasElementTag(oldTag: string, newTag: string) {
        if (GameSoundManager._children[oldTag]) {
            GameSoundManager._children[newTag] = GameSoundManager._children[oldTag]
            delete GameSoundManager._children[oldTag]
        }
    }

    static clear() {
        GameSoundManager.removeCanvasElements()
    }

    /* Export and Import Methods */

    public static exportJson(): string {
        return JSON.stringify(this.export())
    }
    public static export(): ExportedCanvas {
        let currentElements: { [tag: string]: ICanvasBaseMemory } = {}
        for (let tag in GameSoundManager._children) {
            currentElements[tag] = exportCanvasElement(GameSoundManager._children[tag])
        }
        return {
            currentTickers: createExportableElement(GameSoundManager.currentTickersWithoutCreatedBySteps),
            currentTickersSteps: createExportableElement(GameSoundManager._currentTickersSteps),
            currentElements: createExportableElement(currentElements),
            childrenTagsOrder: createExportableElement(GameSoundManager.childrenTagsOrder),
        }
    }
    public static importJson(dataString: string) {
        GameSoundManager.import(JSON.parse(dataString))
    }
    public static import(data: object) {
        GameSoundManager.clear()
        try {
            if (data.hasOwnProperty("childrenTagsOrder") && data.hasOwnProperty("currentElements")) {
                let currentElements = (data as ExportedCanvas)["currentElements"]
                let childrenTagsOrder = (data as ExportedCanvas)["childrenTagsOrder"]
                childrenTagsOrder.forEach((tag) => {
                    if (currentElements[tag]) {
                        let element = importCanvasElement(currentElements[tag])
                        GameSoundManager.addCanvasElement(tag, element)
                        GameSoundManager.childrenTagsOrder.push(tag)
                    }
                })
            }
            else {
                console.error("[Pixi'VN] The data does not have the properties childrenTagsOrder and currentElements")
                return
            }
            if (data.hasOwnProperty("currentTickers")) {
                let currentTickers = (data as ExportedCanvas)["currentTickers"]
                for (let id in currentTickers) {
                    let t = currentTickers[id]
                    let tags: string[] = t.canvasElementTags
                    let ticker = geTickerInstanceById(t.id, t.args, t.duration, t.priority)
                    if (ticker) {
                        GameSoundManager.addTicker(tags, ticker)
                    }
                    else {
                        console.error(`[Pixi'VN] Ticker ${t.id} not found`)
                    }
                }
            }
            if (data.hasOwnProperty("currentTickersSteps")) {
                let currentTickersSteps = (data as ExportedCanvas)["currentTickersSteps"]
                GameSoundManager.restoneTickersSteps(currentTickersSteps)
            }
        }
        catch (e) {
            console.error("[Pixi'VN] Error importing data", e)
        }
    }
}
