import { ChoiceMenuOptionLabel, GameStepManager, GameWindowManager, Label, labelDecorator, setChoiceMenuOptions, setDialogue, StepLabelType } from "@drincs/pixi-vn";
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
                setChoiceMenuOptions([
                    new ChoiceMenuOptionLabel("Events Test", EventsTestLabel),
                    new ChoiceMenuOptionLabel("Show Image Test", ShowImageTest),
                    new ChoiceMenuOptionLabel("Ticker Test", TickerTestLabel),
                    new ChoiceMenuOptionLabel("Tinting Test", TintingTestLabel),
                    new ChoiceMenuOptionLabel("Base Canvas Element Test Label", BaseCanvasElementTestLabel)
                ])
            },
            () => GameStepManager.jumpLabel(StartLabel),
        ]
    }
}
