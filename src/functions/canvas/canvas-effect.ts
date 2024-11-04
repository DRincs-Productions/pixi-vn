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
    let type = props.type || "horizontal"
    let maximumShockSize = props.maximumShockSize || 10
    let shocksNumber = (props.shocksNumber || 10) - 1
    if (shocksNumber < 2) {
        console.error("[Pixi’VN] The number of shocks must be at least 3.")
        return
    }
    let upshocksNumber = Math.floor(shocksNumber / 2)
    let downshocksNumber = Math.ceil(shocksNumber / 2)


    let moveTickers: MoveTicker[] = []
    for (let i = 0; i < upshocksNumber; i++) {
        let destination = { x: 0, y: 0 }
        let shockSize = maximumShockSize * (i + 1) / upshocksNumber
        if (type === "horizontal") {
            destination.x = shockSize
        }
        else {
            destination.y = shockSize
        }
        // se è pari lo faccio a sinistra altrimenti a destra
        if (i % 2 === 0) {
            destination.x = -destination.x
            destination.y = -destination.y
        }
        moveTickers.push(new MoveTicker({
            destination,
            speed,
            speedProgression,
            startOnlyIfHaveTexture,
        }, undefined, priority))
    }
    let lastItemIsLeft = upshocksNumber % 2 === 0
    for (let i = downshocksNumber; i > 0; i--) {
        let destination = { x: 0, y: 0 }
        let shockSize = maximumShockSize * (i + 1) / (downshocksNumber - 1)
        if (type === "horizontal") {
            destination.x = shockSize
        }
        else {
            destination.y = shockSize
        }
        // se è pari lo faccio a sinistra altrimenti a destra
        if ((i % 2 === 0 && !lastItemIsLeft) || (i % 2 !== 0 && lastItemIsLeft)) {
            destination.x = -destination.x
            destination.y = -destination.y
        }
        moveTickers.push(new MoveTicker({
            destination,
            speed,
            speedProgression,
            startOnlyIfHaveTexture,
        }, undefined, priority))
    }

    moveTickers.push(new MoveTicker({
        destination: { x: 0, y: 0 },
        speed,
        speedProgression,
        startOnlyIfHaveTexture,
    }, undefined, priority))
    let id = canvas.addTickersSteps(alias, moveTickers)
    id && canvas.addTickerMustBeCompletedBeforeNextStep({ id: id, alias: alias })
}
