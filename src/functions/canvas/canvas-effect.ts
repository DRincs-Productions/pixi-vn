import { UPDATE_PRIORITY } from "pixi.js"
import { MoveTicker } from "../../classes/ticker"
import { ShakeEffectProps } from "../../interface"
import { canvas } from "../../managers"

/**
 * Shake the canvas element.
 * If there is a/more ticker(s) with the same alias, then the ticker(s) is/are paused.
 * @param alias
 * @param props
 * @param priority
 * @returns
 */
export async function shakeEffect(
    alias: string,
    props: ShakeEffectProps = {},
    priority?: UPDATE_PRIORITY,
): Promise<void> {
    let elemet = canvas.find(alias)
    if (!elemet) {
        console.error(`[Pixi’VN] The element with the alias ${alias} does not exist. So the shake effect can't be applied.`)
        return
    }
    let position = { x: elemet.position.x, y: elemet.position.y }
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
        let destination = { x: position.x, y: position.y }
        let shockSize = maximumShockSize * (i + 1) / upshocksNumber
        if (type === "horizontal") {
            if (i % 2 !== 0) {
                destination.x = position.x + shockSize
            }
            else {
                destination.x = position.x - shockSize
            }
        }
        else {
            if (i % 2 !== 0) {
                destination.y = position.y + shockSize
            }
            else {
                destination.y = position.y - shockSize
            }
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
        let destination = { x: position.x, y: position.y }
        let shockSize = maximumShockSize * (i + 1) / (downshocksNumber - 1)
        if (type === "horizontal") {
            if ((i % 2 === 0 && !lastItemIsLeft) || (i % 2 !== 0 && lastItemIsLeft)) {
                destination.x = position.x - shockSize
            }
            else {
                destination.x = position.x + shockSize
            }
        }
        else {
            if ((i % 2 === 0 && !lastItemIsLeft) || (i % 2 !== 0 && lastItemIsLeft)) {
                destination.y = position.y - shockSize
            }
            else {
                destination.y = position.y + shockSize
            }
        }
        moveTickers.push(new MoveTicker({
            destination,
            speed,
            speedProgression,
            startOnlyIfHaveTexture,
        }, undefined, priority))
    }

    moveTickers.push(new MoveTicker({
        destination: position,
        speed,
        speedProgression,
        startOnlyIfHaveTexture,
        tickerAliasToResume: alias,
    }, undefined, priority))
    let id = canvas.addTickersSteps(alias, moveTickers)
    if (id) {
        canvas.completeTickerOnStepEnd({ id: id, alias: alias })
        canvas.putOnPauseTicker(alias, { tickerIdsExcluded: [id] })
    }
}
