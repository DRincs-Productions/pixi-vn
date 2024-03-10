import { Label } from "../lib/classes/Label";
import { MenuOptionLabel } from "../lib/classes/MenuOptionLabel";
import { labelDecorator } from "../lib/decorators/LabelDecorator";
import { setDialogue } from "../lib/functions/DialogueUtility";
import { StepLabelType } from "../lib/types/StepLabelType";
import { EventsTestLabel } from "./EventsTestLabel";
import { ShowImageTest } from "./ShowImageTest";
import { TickerTestLabel } from "./TickerTestLabel";
import { TintingTestLabel } from "./TintingTestLabel";

@labelDecorator()
export class StartLabel extends Label {
    override get steps(): StepLabelType[] {
        return [
            () => {
                setDialogue("StartLabel")
                return [
                    new MenuOptionLabel("EventsTestLabel", EventsTestLabel),
                    new MenuOptionLabel("ShowImageTest", ShowImageTest),
                    new MenuOptionLabel("TickerTestLabel", TickerTestLabel),
                    new MenuOptionLabel("TintingTestLabel", TintingTestLabel),
                ]
            },
        ]
    }
}
