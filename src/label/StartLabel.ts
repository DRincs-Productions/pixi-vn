import { Label } from "../../lib/classes/Label";
import { MenuOptionLabel } from "../../lib/classes/MenuOptionLabel";
import { labelDecorator } from "../../lib/decorators/LabelDecorator";
import { setDialogue, setMenuOptions } from "../../lib/functions/DialogueUtility";
import { GameStepManager } from "../../lib/managers/StepManager";
import { GameWindowManager } from "../../lib/managers/WindowManager";
import { StepLabelType } from "../../lib/types/StepLabelType";
import { liam } from "../values/characters";
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
                ])
            },
            () => GameStepManager.jumpLabel(StartLabel),
        ]
    }
}
