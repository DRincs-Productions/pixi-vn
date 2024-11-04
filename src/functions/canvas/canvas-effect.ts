import { UPDATE_PRIORITY } from "pixi.js"
import { MoveTicker } from "../../classes/ticker"
import { ShakeEffectProps } from "../../interface"
import { canvas } from "../../managers"

export async function shakeEffect(
    alias: string,
    props: ShakeEffectProps = {},
    priority?: UPDATE_PRIORITY,
): Promise<void> {
    let speed = props.speed || 20
    let speedProgression = props.speedProgression || undefined
    let startOnlyIfHaveTexture = props.startOnlyIfHaveTexture || false
    let shocksNumber = props.shocksNumber || 8
    let type = props.type || "horizontal"
    let maximumShockSize = props.maximumShockSize || 10
    let moveTickers: MoveTicker[] = [
        new MoveTicker({
            destination: { x: 5, y: 0 },
            speed,
            speedProgression,
            startOnlyIfHaveTexture,
        }, undefined, priority),
        new MoveTicker({
            destination: { x: -7, y: 0 },
            speed,
            speedProgression,
            startOnlyIfHaveTexture,
        }, undefined, priority),
        new MoveTicker({
            destination: { x: 10, y: 0 },
            speed,
            speedProgression,
            startOnlyIfHaveTexture,
        }, undefined, priority),
        new MoveTicker({
            destination: { x: -10, y: 0 },
            speed,
            speedProgression,
            startOnlyIfHaveTexture,
        }, undefined, priority),
        new MoveTicker({
            destination: { x: 8, y: 0 },
            speed,
            speedProgression,
            startOnlyIfHaveTexture,
        }, undefined, priority),
        new MoveTicker({
            destination: { x: -6, y: 0 },
            speed,
            speedProgression,
            startOnlyIfHaveTexture,
        }, undefined, priority),
        new MoveTicker({
            destination: { x: 4, y: 0 },
            speed,
            speedProgression,
            startOnlyIfHaveTexture,
        }, undefined, priority),
        new MoveTicker({
            destination: { x: -2, y: 0 },
            speed,
            speedProgression,
            startOnlyIfHaveTexture,
        }, undefined, priority),
    ]
    moveTickers.push(new MoveTicker({
        destination: { x: 0, y: 0 },
        speed,
        speedProgression,
        startOnlyIfHaveTexture,
    }, undefined, priority))
    let id = canvas.addTickersSteps(alias, moveTickers)
    id && canvas.addTickerMustBeCompletedBeforeNextStep({ id: id, alias: alias })
}
