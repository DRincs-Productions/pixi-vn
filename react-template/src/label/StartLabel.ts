import { GameStepManager, GameWindowManager, Label, labelDecorator, MenuOptionLabel, setDialogue, setMenuOptions, StepLabelType } from "@drincs/pixi-vn";
import { liam } from "../values/characters";
import { BaseCanvasElementTestLabel } from "./BaseCanvasElementTestLabel";
import { EventsTestLabel } from "./EventsTestLabel";
import { ShowImageTest } from "./ShowImageTest";
import { TickerTestLabel } from "./TickerTestLabel";
import { TintingTestLabel } from "./TintingTestLabel";

@labelDecorator()
export class StartLabel extends Label {
    override get steps(): StepLabelType[] {
        return [
            () => {
                GameWindowManager.clear()
                setDialogue({ character: liam, text: "Which test do you want to perform?" })
                setMenuOptions([
                    new MenuOptionLabel("Events Test", EventsTestLabel),
                    new MenuOptionLabel("Show Image Test", ShowImageTest),
                    new MenuOptionLabel("Ticker Test", TickerTestLabel),
                    new MenuOptionLabel("Tinting Test", TintingTestLabel),
                    new MenuOptionLabel("Base Canvas Element Test Label", BaseCanvasElementTestLabel)
                ])
            },
            () => GameStepManager.jumpLabel(StartLabel),
        ]
    }
}
