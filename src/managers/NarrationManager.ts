import diff from "microdiff";
import { SYSTEM_RESERVED_STORAGE_KEYS } from "..";
import { Dialogue, Label } from "../classes";
import { CharacterInterface, HistoryStep, HistoryStepData, NarrativeHistory } from "../interface";
import ExportedStep from "../interface/export/ExportedStep";
import { AdditionalShaSpetsEnum } from "../interface/HistoryStep";
import NarrationManagerInterface from "../interface/managers/NarrationManagerInterface";
import ChoiceMenuOption, {
    ChoiceMenuOptionClose,
    IStoratedChoiceMenuOption,
} from "../narration/classes/ChoiceMenuOption";
import newCloseLabel, { CLOSE_LABEL_ID } from "../narration/classes/CloseLabel";
import LabelAbstract from "../narration/classes/LabelAbstract";
import { getLabelById } from "../narration/decorators/label-decorator";
import {
    ChoiceMenuOptionsType,
    Close,
    DialogueType,
    HistoryChoiceMenuOption,
    InputInfo,
    StorageElementType,
} from "../types";
import ChoicesMadeType from "../types/ChoicesMadeType";
import { LabelIdType } from "../types/LabelIdType";
import { StepLabelPropsType, StepLabelResultType, StepLabelType } from "../types/StepLabelType";
import GameUnifier from "../unifier";
import { logger } from "../utils/log-utility";
import NarrationManagerStatic from "./NarrationManagerStatic";
import StorageManagerStatic from "./StorageManagerStatic";

/**
 * This class is a class that manages the steps and labels of the game.
 */
export default class NarrationManager implements NarrationManagerInterface {
    constructor(
        private readonly getCurrentStepData: () => HistoryStepData,
        private readonly restoreFromHistoryStep: (
            restoredStep: HistoryStepData,
            navigate: (path: string) => void
        ) => Promise<void>,
        private readonly forceCompletionOfTicker: () => void
    ) {
        GameUnifier.getLastStepIndex = () => this.lastStepIndex;
    }
    get stepsHistory() {
        return NarrationManagerStatic._stepsHistory;
    }
    get currentStepTimesCounter(): number {
        return NarrationManagerStatic.getCurrentStepTimesCounter();
    }
    set currentStepTimesCounter(_: 0) {
        NarrationManagerStatic.resetCurrentStepTimesCounter();
    }
    getRandomNumber(min: number, max: number, options: { onceOnly?: boolean } = {}): number | undefined {
        return NarrationManagerStatic.getRandomNumber(min, max, options);
    }
    get lastStepIndex() {
        return NarrationManagerStatic._lastStepIndex;
    }
    get openedLabels() {
        return NarrationManagerStatic._openedLabels;
    }
    get currentLabel(): Label | undefined {
        return NarrationManagerStatic._currentLabel;
    }

    /* Edit History Methods */

    /**
     * Add a label to the history.
     * @param label The label to add to the history.
     */
    private addStepHistory(stepSha: string, choiseMade?: number) {
        let currentStepData: HistoryStepData = this.getCurrentStepData();
        if (NarrationManagerStatic.originalStepData) {
            if (NarrationManagerStatic.originalStepData.openedLabels.length === currentStepData.openedLabels.length) {
                try {
                    let lastStepDataOpenedLabelsString = JSON.stringify(
                        NarrationManagerStatic.originalStepData.openedLabels
                    );
                    let historyStepOpenedLabelsString = JSON.stringify(currentStepData.openedLabels);
                    if (
                        lastStepDataOpenedLabelsString === historyStepOpenedLabelsString &&
                        NarrationManagerStatic.originalStepData.path === currentStepData.path &&
                        NarrationManagerStatic.originalStepData.labelIndex === currentStepData.labelIndex
                    ) {
                        return;
                    }
                } catch (e) {
                    logger.error("Error comparing openedLabels", e);
                }
            }
        }
        let data = diff(NarrationManagerStatic.originalStepData, currentStepData);
        if (data) {
            let dialoge: Dialogue | undefined = undefined;
            let requiredChoices: IStoratedChoiceMenuOption[] | undefined = undefined;
            let inputValue: StorageElementType | undefined = undefined;
            if (
                StorageManagerStatic.getVariable<number>(
                    SYSTEM_RESERVED_STORAGE_KEYS.LAST_DIALOGUE_ADDED_IN_STEP_MEMORY_KEY
                ) === this.lastStepIndex
            ) {
                dialoge = this.dialogue;
            }
            if (
                StorageManagerStatic.getVariable<number>(
                    SYSTEM_RESERVED_STORAGE_KEYS.LAST_MENU_OPTIONS_ADDED_IN_STEP_MEMORY_KEY
                ) === this.lastStepIndex
            ) {
                requiredChoices = StorageManagerStatic.getVariable<IStoratedChoiceMenuOption[]>(
                    SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_MENU_OPTIONS_MEMORY_KEY
                );
            }
            if (
                StorageManagerStatic.getVariable<StorageElementType>(
                    SYSTEM_RESERVED_STORAGE_KEYS.LAST_INPUT_ADDED_IN_STEP_MEMORY_KEY
                ) === this.lastStepIndex
            ) {
                inputValue = StorageManagerStatic.getVariable<IStoratedChoiceMenuOption[]>(
                    SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_INPUT_VALUE_MEMORY_KEY
                );
            }
            this.stepsHistory.push({
                diff: data,
                currentLabel: NarrationManagerStatic.currentLabelId,
                dialoge: dialoge,
                choices: requiredChoices,
                stepSha1: stepSha,
                index: this.lastStepIndex,
                labelStepIndex: NarrationManagerStatic.currentLabelStepIndex,
                choiceIndexMade: choiseMade,
                inputValue: inputValue,
                alreadyMadeChoices: this.alreadyCurrentStepMadeChoices,
            });
            NarrationManagerStatic.originalStepData = currentStepData;
        }
        NarrationManagerStatic.increaseLastStepIndex();
    }
    closeCurrentLabel() {
        if (!NarrationManagerStatic.currentLabelId) {
            logger.warn("No label to close");
            return;
        }
        if (!this.currentLabel) {
            logger.error("currentLabel not found");
            return;
        }
        NarrationManagerStatic._openedLabels.pop();
        StorageManagerStatic.clearOldTempVariables(this.openedLabels.length);
    }
    closeAllLabels() {
        while (NarrationManagerStatic._openedLabels.length > 0) {
            this.closeCurrentLabel();
            StorageManagerStatic.clearOldTempVariables(this.openedLabels.length);
        }
    }
    get narrativeHistory(): NarrativeHistory[] {
        let list: NarrativeHistory[] = [];
        this.stepsHistory.forEach((step) => {
            let dialoge = step.dialoge;
            let requiredChoices = step.choices;
            let inputValue = step.inputValue;
            if (
                list.length > 0 &&
                list[list.length - 1].choices &&
                !list[list.length - 1].playerMadeChoice &&
                step.currentLabel
            ) {
                let oldChoices = list[list.length - 1].choices;
                if (oldChoices) {
                    let choiceMade = false;
                    if (step.choiceIndexMade !== undefined && oldChoices.length > step.choiceIndexMade) {
                        oldChoices[step.choiceIndexMade].isResponse = true;
                        choiceMade = true;
                    }
                    list[list.length - 1].playerMadeChoice = choiceMade;
                    list[list.length - 1].choices = oldChoices;
                }
            }
            if (inputValue && list.length > 0) {
                list[list.length - 1].inputValue = inputValue;
            }
            if (dialoge || requiredChoices) {
                let choices: HistoryChoiceMenuOption[] | undefined = requiredChoices?.map((choice, index) => {
                    let hidden: boolean = false;
                    if (choice.oneTime && step.alreadyMadeChoices && step.alreadyMadeChoices.includes(index)) {
                        hidden = true;
                    }
                    return {
                        text: choice.text,
                        type: choice.type,
                        isResponse: false,
                        hidden: hidden,
                    };
                });
                // if all choices are hidden find onlyHaveNoChoice
                if (choices && choices.every((choice) => choice.hidden)) {
                    let onlyHaveNoChoice = choices.find((choice) => choice.hidden === false);
                    if (onlyHaveNoChoice) {
                        onlyHaveNoChoice.hidden = false;
                    }
                }
                list.push({
                    dialoge: dialoge,
                    playerMadeChoice: false,
                    choices: choices,
                    stepIndex: step.index,
                });
            }
        });
        return list;
    }
    removeNarrativeHistory(itemsNumber?: number) {
        if (itemsNumber) {
            // remove the first items
            this.stepsHistory.splice(0, itemsNumber);
        } else {
            NarrationManagerStatic._stepsHistory = [];
        }
    }
    public isLabelAlreadyCompleted<Label extends LabelAbstract<any>>(label: LabelIdType | Label): boolean {
        let labelId: LabelIdType;
        if (typeof label === "string") {
            labelId = label;
        } else {
            labelId = label.id;
        }
        let allOpenedLabels = NarrationManagerStatic.allOpenedLabels;
        let lastStep = allOpenedLabels[labelId]?.biggestStep || 0;
        if (lastStep) {
            let currentLabel = getLabelById(labelId);
            if (currentLabel) {
                return currentLabel.steps.length <= lastStep;
            }
        }
        return false;
    }
    private get alreadyCurrentStepMadeChoicesObj(): ChoicesMadeType[] | undefined {
        let currentLabelStepIndex = NarrationManagerStatic.currentLabelStepIndex;
        let currentLabel = this.currentLabel;
        if (currentLabelStepIndex === null || !currentLabel) {
            return;
        }
        let stepSha = currentLabel.getStepSha1(currentLabelStepIndex);
        if (!stepSha) {
            logger.warn("stepSha not found, setting to ERROR");
            stepSha = AdditionalShaSpetsEnum.ERROR;
        }
        return NarrationManagerStatic.allChoicesMade.filter((choice) => {
            return (
                choice.labelId === currentLabel?.id &&
                choice.stepIndex === currentLabelStepIndex &&
                choice.stepSha1 === stepSha
            );
        });
    }
    get alreadyCurrentStepMadeChoices(): number[] | undefined {
        return this.alreadyCurrentStepMadeChoicesObj?.map((choice) => choice.choiceIndex);
    }
    get isCurrentStepAlreadyOpened(): boolean {
        let currentLabel = NarrationManagerStatic.currentLabelId;
        if (currentLabel) {
            let lastStep = NarrationManagerStatic.allOpenedLabels[currentLabel]?.openCount || 0;
            if (
                NarrationManagerStatic.currentLabelStepIndex &&
                lastStep >= NarrationManagerStatic.currentLabelStepIndex
            ) {
                return true;
            }
        }
        return false;
    }
    public getTimesLabelOpened(label: LabelIdType): number {
        return NarrationManagerStatic.allOpenedLabels[label]?.openCount || 0;
    }
    public getTimesChoiceMade(index: number): number {
        return this.alreadyCurrentStepMadeChoicesObj?.find((choice) => choice.choiceIndex === index)?.madeTimes || 0;
    }
    addCurrentStepToHistory(): void {
        let currentLabelStepIndex = NarrationManagerStatic.currentLabelStepIndex;
        if (currentLabelStepIndex === null) {
            logger.error("currentLabelStepIndex is null");
            return;
        }
        let currentLabel = NarrationManagerStatic._currentLabel;
        if (!currentLabel) {
            logger.error("currentLabel not found");
            return;
        }
        if (currentLabel.steps.length > currentLabelStepIndex) {
            this.addStepHistory(AdditionalShaSpetsEnum.DEVELOPER);
        }
    }

    /* Run Methods */

    private getCanGoNext(options?: {
        /**
         * If true, show a warning in the console.
         * @default false
         */
        showWarn?: boolean;
    }): boolean {
        let showWarn = options?.showWarn || false;
        let choiceMenuOptions = this.choiceMenuOptions;
        if (choiceMenuOptions && choiceMenuOptions.length > 0) {
            showWarn && logger.warn("The player must make a choice");
            return false;
        }
        if (this.isRequiredInput) {
            showWarn && logger.warn("The player must enter a value");
            return false;
        }
        return true;
    }
    get canGoNext(): boolean {
        if (NarrationManagerStatic.stepsRunning !== 0) {
            return false;
        }
        return this.getCanGoNext();
    }
    public async goNext(
        props: StepLabelPropsType,
        options: { choiseMade?: number; runNow?: boolean } = {}
    ): Promise<StepLabelResultType> {
        const { runNow = false } = options;
        if (!runNow && !this.getCanGoNext({ showWarn: true })) {
            return;
        }
        if (!runNow && NarrationManagerStatic.stepsRunning !== 0) {
            NarrationManagerStatic.goNextRequests++;
            return;
        }
        if (this.currentLabel && this.currentLabel.onStepEnd) {
            await this.currentLabel.onStepEnd(NarrationManagerStatic.currentLabelStepIndex || 0, this.currentLabel);
        }
        if (NarrationManagerStatic.stepsRunning === 0) {
            this.forceCompletionOfTicker();
        }
        NarrationManagerStatic.increaseCurrentStepIndex();
        return await this.runCurrentStep(props, options);
    }
    /**
     * Execute the current step and add it to the history.
     * @param props The props to pass to the step.
     * @param options The options.
     * @returns StepLabelResultType or undefined.
     */
    private async runCurrentStep<T extends {}>(
        props: StepLabelPropsType<T>,
        options: {
            /**
             * The index of the choise made by the player. (This params is used in the choice menu)
             */
            choiseMade?: number;
        } = {}
    ): Promise<StepLabelResultType> {
        const { choiseMade } = options;
        if (NarrationManagerStatic.currentLabelId) {
            let currentLabelStepIndex = NarrationManagerStatic.currentLabelStepIndex;
            if (currentLabelStepIndex === null) {
                logger.error("currentLabelStepIndex is null");
                return;
            }
            let currentLabel = NarrationManagerStatic._currentLabel as Label<T> | undefined;
            if (!currentLabel) {
                logger.error("currentLabel not found");
                return;
            }
            if (currentLabel.steps.length > currentLabelStepIndex) {
                let onStepRun = currentLabel.onStepStart;
                if (onStepRun) {
                    try {
                        await onStepRun(currentLabelStepIndex, currentLabel);
                    } catch (e) {
                        logger.error("Error running onStepStart", e);
                        if (this.onStepError) {
                            this.onStepError(e, props);
                        }
                        return;
                    }
                }
                let step = currentLabel.steps[currentLabelStepIndex];
                let stepSha = currentLabel.getStepSha1(currentLabelStepIndex);
                if (!stepSha) {
                    logger.warn("stepSha not found, setting to ERROR");
                    stepSha = AdditionalShaSpetsEnum.ERROR;
                }
                try {
                    NarrationManagerStatic.stepsRunning++;
                    let result = await step(props, { labelId: currentLabel.id });

                    let choiceMenuOptions = this.choiceMenuOptions;
                    if (choiceMenuOptions?.length === 1 && choiceMenuOptions[0].autoSelect) {
                        let choice = choiceMenuOptions[0];
                        result = await this.selectChoice(choice, props);
                    }

                    let lastHistoryStep = NarrationManagerStatic.lastHistoryStep;
                    if (choiseMade !== undefined && lastHistoryStep) {
                        let stepSha = lastHistoryStep.stepSha1;
                        if (!stepSha) {
                            logger.warn("stepSha not found, setting to ERROR");
                            stepSha = AdditionalShaSpetsEnum.ERROR;
                        }
                        NarrationManagerStatic.addChoicesMade(
                            lastHistoryStep.currentLabel || "error",
                            typeof lastHistoryStep.labelStepIndex === "number" ? lastHistoryStep.labelStepIndex : -1,
                            lastHistoryStep.stepSha1 || AdditionalShaSpetsEnum.ERROR,
                            choiseMade
                        );
                        NarrationManagerStatic.choiseMadeTemp = choiseMade;
                    }

                    NarrationManagerStatic.stepsRunning--;
                    if (NarrationManagerStatic.stepsRunning === 0) {
                        NarrationManagerStatic.addLabelHistory(currentLabel.id, currentLabelStepIndex);
                        this.addStepHistory(stepSha, NarrationManagerStatic.choiseMadeTemp);
                        NarrationManagerStatic.choiseMadeTemp = undefined;

                        if (NarrationManagerStatic.goNextRequests > 0) {
                            NarrationManagerStatic.goNextRequests--;
                            return await this.goNext(props);
                        }
                    }
                    return result;
                } catch (e) {
                    if (NarrationManagerStatic.stepsRunning > 0) {
                        NarrationManagerStatic.stepsRunning--;
                    }
                    // TODO: It might be useful to revert to the original state to avoid errors, but I don't have the browser to do that and I haven't asked for it yet.
                    // await GameStepManager.restoreFromHistoryStep(GameStepManager.originalStepData, navigate)
                    logger.error("Error running step", e);
                    if (this.onStepError) {
                        this.onStepError(e, props);
                    }
                    return;
                }
            } else if (this.openedLabels.length > 1) {
                this.closeCurrentLabel();
                return await this.goNext(props, options);
            } else if (this.openedLabels.length === 1) {
                NarrationManagerStatic.restoreLastLabelList();
                if (this.onGameEnd) {
                    return await this.onGameEnd(props, { labelId: "end" });
                }
                return;
            }
        } else if (this.openedLabels.length === 0) {
            NarrationManagerStatic.restoreLastLabelList();
            if (this.onGameEnd) {
                return await this.onGameEnd(props, { labelId: "end" });
            }
            logger.error(
                "The end of the game is not managed, so the game is blocked. Read this documentation to know how to manage the end of the game: https://pixi-vn.web.app/start/other-narrative-features.html#how-manage-the-end-of-the-game"
            );
            return;
        } else {
            logger.error("currentLabelId not found");
        }
    }
    public async callLabel<T extends {} = {}>(
        label: Label<T> | LabelIdType,
        props: StepLabelPropsType<T>
    ): Promise<StepLabelResultType> {
        let choiseMade: number | undefined = undefined;
        let labelId: LabelIdType;
        if (typeof label === "string") {
            labelId = label;
        } else {
            labelId = label.id;
            if (typeof label.choiseIndex === "number") {
                choiseMade = label.choiseIndex;
            }
        }
        try {
            if (labelId === CLOSE_LABEL_ID) {
                let closeCurrentLabel = newCloseLabel<T>(choiseMade);
                let choice: ChoiceMenuOptionClose<T> = {
                    label: closeCurrentLabel,
                    text: "",
                    closeCurrentLabel: false,
                    type: "close",
                    oneTime: false,
                    onlyHaveNoChoice: false,
                    autoSelect: false,
                    props: {},
                };
                return this.closeChoiceMenu(choice, props);
            }
            let tempLabel = getLabelById<Label<T>>(labelId);
            if (!tempLabel) {
                throw new Error(`[Pixi’VN] Label ${labelId} not found`);
            }

            if (this.currentLabel && this.currentLabel.onStepEnd) {
                await this.currentLabel.onStepEnd(NarrationManagerStatic.currentLabelStepIndex || 0, this.currentLabel);
            }
            NarrationManagerStatic.pushNewLabel(tempLabel.id);
        } catch (e) {
            logger.error("Error calling label", e);
            return;
        }
        return await this.runCurrentStep<T>(props, { choiseMade: choiseMade });
    }
    public async jumpLabel<T extends {}>(
        label: Label<T> | LabelIdType,
        props: StepLabelPropsType<T>
    ): Promise<StepLabelResultType> {
        this.closeCurrentLabel();
        let choiseMade: number | undefined = undefined;
        let labelId: LabelIdType;
        if (typeof label === "string") {
            labelId = label;
        } else {
            labelId = label.id;
            if (typeof label.choiseIndex === "number") {
                choiseMade = label.choiseIndex;
            }
        }
        try {
            if (labelId === CLOSE_LABEL_ID) {
                let closeCurrentLabel = newCloseLabel<T>(choiseMade);
                let choice: ChoiceMenuOptionClose<T> = {
                    label: closeCurrentLabel,
                    text: "",
                    closeCurrentLabel: false,
                    type: "close",
                    oneTime: false,
                    onlyHaveNoChoice: false,
                    autoSelect: false,
                    props: {},
                };
                return this.closeChoiceMenu<T>(choice, props);
            }
            let tempLabel = getLabelById<Label<T>>(labelId);
            if (!tempLabel) {
                throw new Error(`[Pixi’VN] Label ${labelId} not found`);
            }

            if (this.currentLabel && this.currentLabel.onStepEnd) {
                await this.currentLabel.onStepEnd(NarrationManagerStatic.currentLabelStepIndex || 0, this.currentLabel);
            }
            NarrationManagerStatic.pushNewLabel(tempLabel.id);
        } catch (e) {
            logger.error("Error jumping label", e);
            return;
        }
        return await this.runCurrentStep<T>(props, { choiseMade: choiseMade });
    }
    public async selectChoice<T extends {}>(
        item: ChoiceMenuOptionClose | ChoiceMenuOption<T>,
        props: StepLabelPropsType<T>
    ): Promise<StepLabelResultType> {
        this.choiceMenuOptions = undefined;
        if (item.type == "call") {
            return await this.callLabel(item.label, { ...item.props, ...props });
        } else if (item.type == "jump") {
            return await this.jumpLabel(item.label, { ...item.props, ...props });
        } else if (item.type == "close") {
            return await this.closeChoiceMenu(item, { ...item.props, ...props });
        } else {
            throw new Error(`[Pixi’VN] Type ${item.type} not found`);
        }
    }
    public async closeChoiceMenu<T extends {} = {}>(
        choice: ChoiceMenuOptionClose<T>,
        props: StepLabelPropsType<T>
    ): Promise<StepLabelResultType> {
        let label: Label<T> = choice.label;
        let choiseMade: number | undefined = undefined;
        if (typeof label.choiseIndex === "number") {
            choiseMade = label.choiseIndex;
        }
        if (choice.closeCurrentLabel) {
            this.closeCurrentLabel();
        }
        return this.goNext(props, { choiseMade: choiseMade });
    }

    /** Old Step Methods */

    get stepLimitSaved() {
        return NarrationManagerStatic.stepLimitSaved;
    }
    set stepLimitSaved(limit: number) {
        NarrationManagerStatic.stepLimitSaved = limit;
    }

    /* Go Back & Refresh Methods */

    public async goBack(navigate: (path: string) => void, steps: number = 1): Promise<void> {
        if (steps <= 0) {
            logger.warn("The parameter steps must be greater than 0");
            return;
        }
        if (this.stepsHistory.length <= 1) {
            logger.warn("You can't go back, there is no step to go back");
            return;
        }
        let restoredStep = NarrationManagerStatic.goBackInternal(steps, NarrationManagerStatic.originalStepData);
        if (restoredStep) {
            await this.restoreFromHistoryStep(restoredStep, navigate);
        } else {
            logger.error("Error going back");
        }
    }
    get canGoBack(): boolean {
        if (NarrationManagerStatic._stepsHistory.length <= 1) {
            return false;
        }
        return NarrationManagerStatic.lastHistoryStep?.diff ? true : false;
    }
    public async blockGoBack() {
        if (NarrationManagerStatic.stepsRunning !== 0) {
            NarrationManagerStatic.cleanSteps;
            return;
        }

        if (this.stepsHistory.length > 1) {
            this.stepsHistory[this.stepsHistory.length - 1] = {
                ...this.stepsHistory[this.stepsHistory.length - 1],
                diff: undefined,
            };
        }
    }
    public onGameEnd: StepLabelType | undefined = undefined;
    public onStepError: ((error: any, props: StepLabelPropsType) => void) | undefined = undefined;

    public get dialogue(): Dialogue | undefined {
        return StorageManagerStatic.getVariable<DialogueType>(
            SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_DIALOGUE_MEMORY_KEY
        ) as Dialogue;
    }
    public set dialogue(
        props:
            | {
                  character: string | CharacterInterface;
                  text: string | string[];
              }
            | string
            | string[]
            | Dialogue
            | undefined
    ) {
        if (!props) {
            StorageManagerStatic.setVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_DIALOGUE_MEMORY_KEY, undefined);
            return;
        }
        let text = "";
        let character: string | undefined = undefined;
        let dialogue: Dialogue;
        if (typeof props === "string") {
            text = props;
            dialogue = new Dialogue(text, character);
        } else if (Array.isArray(props)) {
            text = props.join();
            dialogue = new Dialogue(text, character);
        } else if (!(props instanceof Dialogue)) {
            if (Array.isArray(props.text)) {
                text = props.text.join();
            } else {
                text = props.text;
            }
            if (props.character) {
                if (typeof props.character === "string") {
                    character = props.character;
                } else {
                    character = props.character.id;
                }
            }
            dialogue = new Dialogue(text, character);
        } else {
            dialogue = props;
        }

        if (this.dialogGlue) {
            let glueDialogue = StorageManagerStatic.getVariable<DialogueType>(
                SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_DIALOGUE_MEMORY_KEY
            ) as Dialogue;
            if (glueDialogue) {
                dialogue.text = `${glueDialogue.text}${dialogue.text}`;
                dialogue.character = dialogue.character || glueDialogue.character;
            }
            this.dialogGlue = false;
        }

        StorageManagerStatic.setVariable(
            SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_DIALOGUE_MEMORY_KEY,
            dialogue as DialogueType
        );
        StorageManagerStatic.setVariable(
            SYSTEM_RESERVED_STORAGE_KEYS.LAST_DIALOGUE_ADDED_IN_STEP_MEMORY_KEY,
            this.lastStepIndex
        );
    }
    public get choiceMenuOptions(): ChoiceMenuOptionsType<any> | undefined {
        let d = StorageManagerStatic.getVariable<IStoratedChoiceMenuOption[]>(
            SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_MENU_OPTIONS_MEMORY_KEY
        );
        if (d) {
            let options: ChoiceMenuOptionsType = [];
            let onlyHaveNoChoice: ChoiceMenuOptionsType = [];
            d.forEach((option, index) => {
                if (option.type === Close) {
                    let itemLabel = newCloseLabel(index);
                    let choice = new ChoiceMenuOptionClose(option.text, {
                        closeCurrentLabel: option.closeCurrentLabel,
                        oneTime: option.oneTime,
                        onlyHaveNoChoice: option.onlyHaveNoChoice,
                        autoSelect: option.autoSelect,
                    });
                    choice.label = itemLabel;
                    options.push(choice);
                    return;
                }
                let label = getLabelById(option.label);
                if (label) {
                    let itemLabel = new Label(label.id, label.steps, {
                        onStepStart: label.onStepStart,
                        choiseIndex: index,
                    });
                    options.push(
                        new ChoiceMenuOption(option.text, itemLabel, option.props, {
                            type: option.type,
                            oneTime: option.oneTime,
                            onlyHaveNoChoice: option.onlyHaveNoChoice,
                            autoSelect: option.autoSelect,
                        })
                    );
                }
            });
            let alreadyChoices = this.alreadyCurrentStepMadeChoices;
            options = options.filter((option, index) => {
                if (option.oneTime) {
                    if (alreadyChoices && alreadyChoices.includes(index)) {
                        return false;
                    }
                }
                if (option.onlyHaveNoChoice) {
                    onlyHaveNoChoice.push(option);
                    return false;
                }
                return true;
            });
            if (options.length > 0) {
                return options;
            } else if (onlyHaveNoChoice.length > 0) {
                let firstOption = onlyHaveNoChoice[0];
                return [firstOption];
            }
        }
        return undefined;
    }
    public set choiceMenuOptions(options: ChoiceMenuOptionsType<any> | undefined) {
        if (!options) {
            StorageManagerStatic.setVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_MENU_OPTIONS_MEMORY_KEY, undefined);
            return;
        }
        let value: IStoratedChoiceMenuOption[] = options.map((option) => {
            if (option instanceof ChoiceMenuOptionClose) {
                return {
                    text: option.text,
                    type: Close,
                    closeCurrentLabel: option.closeCurrentLabel,
                    oneTime: option.oneTime,
                    onlyHaveNoChoice: option.onlyHaveNoChoice,
                    autoSelect: option.autoSelect,
                };
            }
            return {
                ...option,
                label: option.label.id,
            };
        });
        StorageManagerStatic.setVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_MENU_OPTIONS_MEMORY_KEY, value);
        StorageManagerStatic.setVariable(
            SYSTEM_RESERVED_STORAGE_KEYS.LAST_MENU_OPTIONS_ADDED_IN_STEP_MEMORY_KEY,
            this.lastStepIndex
        );
    }
    public get dialogGlue(): boolean {
        return StorageManagerStatic.getFlag(
            SYSTEM_RESERVED_STORAGE_KEYS.ADD_NEXT_DIALOG_TEXT_INTO_THE_CURRENT_DIALOG_FLAG_KEY
        );
    }
    public set dialogGlue(value: boolean) {
        StorageManagerStatic.setFlag(
            SYSTEM_RESERVED_STORAGE_KEYS.ADD_NEXT_DIALOG_TEXT_INTO_THE_CURRENT_DIALOG_FLAG_KEY,
            value
        );
    }
    public get inputValue(): StorageElementType {
        return StorageManagerStatic.getVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_INPUT_VALUE_MEMORY_KEY);
    }
    public set inputValue(value: StorageElementType) {
        this.removeInputRequest();
        StorageManagerStatic.setVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_INPUT_VALUE_MEMORY_KEY, value);
        StorageManagerStatic.setVariable(
            SYSTEM_RESERVED_STORAGE_KEYS.LAST_INPUT_ADDED_IN_STEP_MEMORY_KEY,
            this.lastStepIndex
        );
    }
    public get isRequiredInput(): boolean {
        return (
            StorageManagerStatic.getVariable<InputInfo>(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_INPUT_INFO_MEMORY_KEY)
                ?.isRequired || false
        );
    }
    public get inputType(): string | undefined {
        return StorageManagerStatic.getVariable<InputInfo>(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_INPUT_INFO_MEMORY_KEY)
            ?.type;
    }
    public requestInput(info: Omit<InputInfo, "isRequired">, defaultValue?: StorageElementType) {
        (info as InputInfo).isRequired = true;
        StorageManagerStatic.setVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_INPUT_INFO_MEMORY_KEY, info);
        if (defaultValue !== undefined) {
            StorageManagerStatic.setVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_INPUT_VALUE_MEMORY_KEY, defaultValue);
        } else {
            StorageManagerStatic.removeVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_INPUT_VALUE_MEMORY_KEY);
        }
    }
    public removeInputRequest() {
        StorageManagerStatic.removeVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_INPUT_INFO_MEMORY_KEY);
        StorageManagerStatic.removeVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_INPUT_VALUE_MEMORY_KEY);
    }

    public clear() {
        NarrationManagerStatic._stepsHistory = [];
        NarrationManagerStatic._openedLabels = [];
        NarrationManagerStatic._lastStepIndex = 0;
        NarrationManagerStatic._originalStepData = undefined;
    }

    /* Export and Import Methods */

    public exportJson(): string {
        return JSON.stringify(this.export());
    }
    public export(): ExportedStep {
        let firstStepToCompres = this.stepsHistory.length - this.stepLimitSaved;
        let stepsHistory: HistoryStep<Dialogue<CharacterInterface>>[] = this.stepsHistory.map((step, index) => ({
            diff: firstStepToCompres > index ? undefined : step.diff,
            ...step,
        }));
        return {
            stepsHistory: stepsHistory,
            openedLabels: NarrationManagerStatic._openedLabels,
            lastStepIndex: this.lastStepIndex,
            originalStepData: NarrationManagerStatic._originalStepData,
        };
    }
    public async importJson(dataString: string) {
        await this.import(JSON.parse(dataString));
    }
    public async import(data: object) {
        this.clear();
        try {
            if (data.hasOwnProperty("stepsHistory")) {
                NarrationManagerStatic._stepsHistory = (data as ExportedStep)["stepsHistory"];
            } else {
                logger.warn("Could not import stepsHistory data, so will be ignored");
            }
            if (data.hasOwnProperty("openedLabels")) {
                NarrationManagerStatic._openedLabels = (data as ExportedStep)["openedLabels"];
            } else {
                logger.warn("Could not import openedLabels data, so will be ignored");
            }
            if (data.hasOwnProperty("lastStepIndex")) {
                NarrationManagerStatic._lastStepIndex = (data as ExportedStep)["lastStepIndex"];
            } else {
                logger.warn("Could not import lastStepIndex data, so will be ignored");
            }
            if (data.hasOwnProperty("originalStepData")) {
                NarrationManagerStatic._originalStepData = (data as ExportedStep)["originalStepData"];
            } else {
                logger.warn("Could not import originalStepData data, so will be ignored");
            }

            if (this.currentLabel && this.currentLabel.onLoadingLabel) {
                await this.currentLabel.onLoadingLabel(
                    NarrationManagerStatic.currentLabelStepIndex || 0,
                    this.currentLabel
                );
                for (let i = 0; i < this.openedLabels.length; i++) {
                    let labelInfo = this.openedLabels[i];
                    let label = getLabelById(labelInfo.label);
                    if (label && label.onLoadingLabel) {
                        await label.onLoadingLabel(labelInfo.currentStepIndex, label);
                    }
                }
            }
        } catch (e) {
            logger.error("Error importing data", e);
        }
    }
}
