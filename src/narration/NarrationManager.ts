import { CharacterInterface, DialogueInterface } from "@drincs/pixi-vn";
import { SYSTEM_RESERVED_STORAGE_KEYS } from "../constants";
import { StorageElementType } from "../storage";
import GameUnifier from "../unifier";
import { createExportableElement } from "../utils";
import { logger } from "../utils/log-utility";
import ChoiceMenuOption from "./classes/ChoiceMenuOption";
import ChoiceMenuOptionClose from "./classes/CloseChoiceOption";
import LabelAbstract from "./classes/LabelAbstract";
import RegisteredLabels from "./decorators/RegisteredLabels";
import { StoredDialogue } from "./interfaces/DialogueInterface";
import HistoryStep, { AdditionalShaSpetsEnum } from "./interfaces/HistoryStep";
import NarrationGameState from "./interfaces/NarrationGameState";
import NarrationManagerInterface from "./interfaces/NarrationManagerInterface";
import StoredChoiceInterface, { StoredIndexedChoiceInterface } from "./interfaces/StoredChoiceInterface";
import NarrationManagerStatic from "./NarrationManagerStatic";
import ChoicesMadeType from "./types/ChoicesMadeType";
import { Close } from "./types/CloseType";
import { InputInfo } from "./types/InputInfo";
import { LabelIdType } from "./types/LabelIdType";
import { StepLabelPropsType, StepLabelResultType, StepLabelType } from "./types/StepLabelType";

/**
 * This class is a class that manages the steps and labels of the game.
 */
export default class NarrationManager implements NarrationManagerInterface {
    get currentStepTimesCounter(): number {
        return NarrationManagerStatic.getCurrentStepTimesCounter();
    }
    set currentStepTimesCounter(_: 0) {
        NarrationManagerStatic.resetCurrentStepTimesCounter();
    }
    getRandomNumber(min: number, max: number, options: { onceOnly?: boolean } = {}): number | undefined {
        return NarrationManagerStatic.getRandomNumber(min, max, options);
    }
    get stepCounter() {
        return NarrationManagerStatic._stepCounter;
    }
    get openedLabels() {
        return NarrationManagerStatic.openedLabels;
    }
    get currentLabel(): LabelAbstract<any> | undefined {
        return NarrationManagerStatic._currentLabel;
    }

    /* Edit History Methods */

    /**
     * Add a label to the history.
     * @param stepSha The sha1 of the step.
     * @param options The options.
     */
    private addStepHistory(
        stepSha: string,
        options: {
            choiceMade?: number;
            ignoreSameStep?: boolean;
        } = {}
    ) {
        const { choiceMade, ignoreSameStep } = options;
        let dialogue: StoredDialogue | undefined = undefined;
        let choices: StoredChoiceInterface[] | undefined = undefined;
        let inputValue: StorageElementType | undefined = undefined;
        let isGlued = GameUnifier.getVariable(SYSTEM_RESERVED_STORAGE_KEYS.LAST_STEP_GLUED) === this.stepCounter;
        if (
            GameUnifier.getVariable<number>(SYSTEM_RESERVED_STORAGE_KEYS.LAST_DIALOGUE_ADDED_IN_STEP_MEMORY_KEY) ===
            this.stepCounter
        ) {
            dialogue = GameUnifier.getVariable<StoredDialogue>(
                SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_DIALOGUE_MEMORY_KEY
            );
        }
        if (
            GameUnifier.getVariable<number>(SYSTEM_RESERVED_STORAGE_KEYS.LAST_MENU_OPTIONS_ADDED_IN_STEP_MEMORY_KEY) ===
            this.stepCounter
        ) {
            choices = GameUnifier.getVariable<any>(
                SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_MENU_OPTIONS_MEMORY_KEY
            ) as StoredChoiceInterface[];
        }
        if (
            GameUnifier.getVariable<StorageElementType>(
                SYSTEM_RESERVED_STORAGE_KEYS.LAST_INPUT_ADDED_IN_STEP_MEMORY_KEY
            ) === this.stepCounter
        ) {
            inputValue = GameUnifier.getVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_INPUT_VALUE_MEMORY_KEY);
        }
        let historyInfo: Omit<HistoryStep, "diff"> = {
            currentLabel: NarrationManagerStatic.currentLabelId,
            dialogue: dialogue,
            choices: choices,
            stepSha1: stepSha,
            index: this.stepCounter,
            labelStepIndex: NarrationManagerStatic.currentLabelStepIndex,
            choiceIndexMade: choiceMade,
            inputValue: inputValue,
            alreadyMadeChoices: this.alreadyCurrentStepMadeChoices,
            isGlued: isGlued,
        };
        NarrationManagerStatic.originalOpenedLabels = NarrationManagerStatic.openedLabels;
        GameUnifier.addHistoryItem(historyInfo, { ignoreSameStep });
        NarrationManagerStatic.lastHistoryStep = historyInfo;
        NarrationManagerStatic.increaseStepCounter();
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
        let openedLabels = NarrationManagerStatic.openedLabels;
        openedLabels.pop();
        NarrationManagerStatic.openedLabels = openedLabels;
        GameUnifier.onLabelClosing(this.openedLabels.length);
    }
    closeAllLabels() {
        while (NarrationManagerStatic.openedLabels.length > 0) {
            this.closeCurrentLabel();
            GameUnifier.onLabelClosing(this.openedLabels.length);
        }
    }
    public isLabelAlreadyCompleted(label: LabelIdType | LabelAbstract<any>): boolean {
        let labelId: LabelIdType;
        if (typeof label === "string") {
            labelId = label;
        } else {
            labelId = label.id;
        }
        let allOpenedLabels = NarrationManagerStatic.allOpenedLabels;
        let lastStep = allOpenedLabels[labelId]?.biggestStep || 0;
        if (lastStep) {
            let currentLabel = RegisteredLabels.get(labelId);
            if (currentLabel) {
                return currentLabel.stepCount <= lastStep;
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
        let stepSha = currentLabel.getStepSha(currentLabelStepIndex);
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
        this.addStepHistory(AdditionalShaSpetsEnum.DEVELOPER, { ignoreSameStep: true });
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
    private async onStepRun(label: LabelAbstract<any, any>, stepId: number) {
        let res: (void | Promise<void> | Promise<void[]>)[] = [];
        if (label.onStepStart) {
            res.push(label.onStepStart(stepId, label));
        }
        if (NarrationManagerStatic.onStepStart) {
            res.push(NarrationManagerStatic.onStepStart(stepId, label));
        }
        return await Promise.all(res);
    }
    private async onStepEnd(label: LabelAbstract<any, any>, stepId: number) {
        let res: (void | Promise<void>)[] = [];
        if (label.onStepEnd) {
            res.push(label.onStepEnd(stepId, label));
        }
        if (NarrationManagerStatic.onStepEnd) {
            res.push(NarrationManagerStatic.onStepEnd(stepId, label));
        }
        return await Promise.all(res);
    }
    public async goNext(
        props: StepLabelPropsType,
        options: { choiceMade?: number; runNow?: boolean } = {}
    ): Promise<StepLabelResultType> {
        const { runNow = false } = options;
        if (!runNow && !this.getCanGoNext({ showWarn: true })) {
            return;
        }
        if (!runNow && NarrationManagerStatic.stepsRunning !== 0) {
            NarrationManagerStatic.goNextRequests++;
            return;
        }
        try {
            this.currentLabel &&
                (await this.onStepEnd(this.currentLabel, NarrationManagerStatic.currentLabelStepIndex || 0));
        } catch (e) {
            logger.error("Error running onStepEnd", e);
        }
        if (NarrationManagerStatic.stepsRunning === 0) {
            await GameUnifier.onGoNextEnd();
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
             * The index of the choice made by the player. (This params is used in the choice menu)
             */
            choiceMade?: number;
        } = {}
    ): Promise<StepLabelResultType> {
        const { choiceMade } = options;
        if (NarrationManagerStatic.currentLabelId) {
            let currentLabelStepIndex = NarrationManagerStatic.currentLabelStepIndex;
            if (currentLabelStepIndex === null) {
                logger.error("currentLabelStepIndex is null");
                return;
            }
            let currentLabel = NarrationManagerStatic._currentLabel as LabelAbstract<any, T> | undefined;
            if (!currentLabel) {
                logger.error("currentLabel not found");
                return;
            }
            if (currentLabel.stepCount > currentLabelStepIndex) {
                try {
                    await this.onStepRun(currentLabel, currentLabelStepIndex);
                } catch (e) {
                    logger.error("Error running onStepStart", e);
                    if (this.onStepError) {
                        this.onStepError(e, props);
                    }
                    return;
                }
                let step = currentLabel.getStepById(currentLabelStepIndex);
                if (!step) {
                    logger.error("step not found");
                    return;
                }
                let stepSha = currentLabel.getStepSha(currentLabelStepIndex);
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
                    if (choiceMade !== undefined && lastHistoryStep) {
                        let stepSha = lastHistoryStep.stepSha1;
                        if (!stepSha) {
                            logger.warn("stepSha not found, setting to ERROR");
                            stepSha = AdditionalShaSpetsEnum.ERROR;
                        }
                        NarrationManagerStatic.addChoicesMade(
                            lastHistoryStep.currentLabel || "error",
                            typeof lastHistoryStep.labelStepIndex === "number" ? lastHistoryStep.labelStepIndex : -1,
                            lastHistoryStep.stepSha1 || AdditionalShaSpetsEnum.ERROR,
                            choiceMade
                        );
                        NarrationManagerStatic.choiceMadeTemp = choiceMade;
                    }

                    NarrationManagerStatic.stepsRunning--;
                    if (NarrationManagerStatic.stepsRunning === 0) {
                        NarrationManagerStatic.addLabelHistory(currentLabel.id, currentLabelStepIndex);
                        this.addStepHistory(stepSha, {
                            ...options,
                            choiceMade: NarrationManagerStatic.choiceMadeTemp,
                        });
                        NarrationManagerStatic.choiceMadeTemp = undefined;

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
                NarrationManagerStatic.openedLabels = [];
                if (this.onGameEnd) {
                    return await this.onGameEnd(props, { labelId: "end" });
                }
                return;
            }
        } else if (this.openedLabels.length === 0) {
            NarrationManagerStatic.openedLabels = NarrationManagerStatic.originalOpenedLabels;
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
        label: LabelAbstract<any, T> | LabelIdType,
        props: StepLabelPropsType<T>,
        options?: {
            /**
             * The index of the choice made by the player. (This params is used in the choice menu)
             */
            choiceMade?: number;
        }
    ): Promise<StepLabelResultType> {
        const { choiceMade } = options || {};
        let labelId: LabelIdType;
        if (typeof label === "string") {
            labelId = label;
        } else {
            labelId = label.id;
        }
        try {
            let tempLabel = RegisteredLabels.get<LabelAbstract<any, T>>(labelId);
            if (!tempLabel) {
                throw new Error(`[Pixi’VN] Label ${labelId} not found`);
            }

            try {
                this.currentLabel &&
                    (await this.onStepEnd(this.currentLabel, NarrationManagerStatic.currentLabelStepIndex || 0));
            } catch (e) {
                logger.error("Error running onStepEnd", e);
            }
            NarrationManagerStatic.pushNewLabel(tempLabel.id); //
        } catch (e) {
            logger.error("Error calling label", e);
            return;
        }
        return await this.runCurrentStep<T>(props, { choiceMade: choiceMade });
    }
    public async jumpLabel<T extends {}>(
        label: LabelAbstract<any, T> | LabelIdType,
        props: StepLabelPropsType<T>,
        options?: {
            /**
             * The index of the choice made by the player. (This params is used in the choice menu)
             */
            choiceMade?: number;
        }
    ): Promise<StepLabelResultType> {
        if (this.openedLabels.length > 0) this.closeCurrentLabel();
        const { choiceMade } = options || {};
        let labelId: LabelIdType;
        if (typeof label === "string") {
            labelId = label;
        } else {
            labelId = label.id;
        }
        try {
            let tempLabel = RegisteredLabels.get<LabelAbstract<any, T>>(labelId);
            if (!tempLabel) {
                throw new Error(`[Pixi’VN] Label ${labelId} not found`);
            }

            try {
                this.currentLabel &&
                    (await this.onStepEnd(this.currentLabel, NarrationManagerStatic.currentLabelStepIndex || 0));
            } catch (e) {
                logger.error("Error running onStepEnd", e);
            }
            NarrationManagerStatic.pushNewLabel(tempLabel.id);
        } catch (e) {
            logger.error("Error jumping label", e);
            return;
        }
        return await this.runCurrentStep<T>(props, { choiceMade: choiceMade });
    }
    public async selectChoice<T extends {}>(
        item: StoredIndexedChoiceInterface,
        props: StepLabelPropsType<T>
    ): Promise<StepLabelResultType> {
        this.choiceMenuOptions = undefined;
        const type = item.type;
        switch (type) {
            case "call":
                return await this.callLabel(
                    item.label,
                    { ...item.props, ...props },
                    {
                        choiceMade: item.choiceIndex,
                    }
                );
            case "jump":
                return await this.jumpLabel(
                    item.label,
                    { ...item.props, ...props },
                    {
                        choiceMade: item.choiceIndex,
                    }
                );
            case "close":
                return await this.closeChoiceMenu(item, { ...item.props, ...props });
            default:
                logger.error(`Type ${type} not found`);
                throw new Error(`[Pixi’VN] Type ${type} not found`);
        }
    }
    /**
     * When the player is in a choice menu, can use this function to exit to the choice menu.
     * @param choice
     * @param props
     * @returns StepLabelResultType or undefined.
     * @example
     * ```typescript
     * narration.closeChoiceMenu(yourParams).then((result) => {
     *     if (result) {
     *         // your code
     *     }
     * })
     * ```
     */
    public async closeChoiceMenu<T extends {} = {}>(
        choice: StoredIndexedChoiceInterface,
        props: StepLabelPropsType<T>
    ): Promise<StepLabelResultType> {
        if (choice.type !== "close") {
            logger.error("For closeChoiceMenu, the type must be close");
            throw new Error("[Pixi’VN] For closeChoiceMenu, the type must be close");
        }
        let choiceMade: number | undefined = undefined;
        if (typeof choice.choiceIndex === "number") {
            choiceMade = choice.choiceIndex;
        }
        if (choice.closeCurrentLabel) {
            this.closeCurrentLabel();
        }
        return this.goNext(props, { choiceMade });
    }

    /* Go Back & Refresh Methods */

    get onGameEnd(): StepLabelType | undefined {
        return GameUnifier.onEnd;
    }
    set onGameEnd(value: StepLabelType) {
        GameUnifier.onEnd = value;
    }
    get onStepError(): ((error: any, props: StepLabelPropsType) => void) | undefined {
        const onError = GameUnifier.onError;
        return onError
            ? (error: any, props: StepLabelPropsType) => {
                  return onError("step", error, props);
              }
            : undefined;
    }
    set onStepError(value: (error: any, props: StepLabelPropsType) => void) {
        GameUnifier.onError = (type: string, error: any, props: StepLabelPropsType) => {
            return value(error, props);
        };
    }

    public get dialogue():
        | (Partial<DialogueInterface> & {
              text: string | string[];
              character?: CharacterInterface | string;
          })
        | undefined {
        const dialogue = GameUnifier.getVariable<StoredDialogue>(
            SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_DIALOGUE_MEMORY_KEY
        );
        if (!dialogue) {
            return undefined;
        }
        return {
            ...dialogue,
            character: dialogue.character
                ? GameUnifier.getCharacter(dialogue.character) || dialogue.character
                : undefined,
        };
    }
    public set dialogue(dialogue: DialogueInterface | string | string[] | undefined) {
        if (!dialogue) {
            GameUnifier.setVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_DIALOGUE_MEMORY_KEY, undefined);
            return;
        }

        if (typeof dialogue === "string" || Array.isArray(dialogue)) {
            dialogue = { text: dialogue };
        }

        if (this.dialogGlue) {
            let glueDialogue = GameUnifier.getVariable<StoredDialogue>(
                SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_DIALOGUE_MEMORY_KEY
            );
            if (glueDialogue) {
                let newText = [];
                if (Array.isArray(glueDialogue.text)) {
                    newText = [...glueDialogue.text];
                } else {
                    newText = [glueDialogue.text];
                }
                if (Array.isArray(dialogue.text)) {
                    newText = [...newText, ...dialogue.text];
                } else {
                    newText = [...newText, dialogue.text];
                }
                dialogue.text = newText;
                dialogue.character = dialogue.character || glueDialogue.character;
            }
            GameUnifier.setVariable(SYSTEM_RESERVED_STORAGE_KEYS.LAST_STEP_GLUED, this.stepCounter);
            this.dialogGlue = false;
        }
        try {
            GameUnifier.setVariable(
                SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_DIALOGUE_MEMORY_KEY,
                createExportableElement({
                    ...dialogue,
                    character: typeof dialogue.character === "string" ? dialogue.character : dialogue.character?.id,
                })
            );
            GameUnifier.setVariable(
                SYSTEM_RESERVED_STORAGE_KEYS.LAST_DIALOGUE_ADDED_IN_STEP_MEMORY_KEY,
                this.stepCounter
            );
        } catch (e) {
            logger.error("DialogueInterface cannot contain functions or classes");
            throw e;
        }
    }
    public get choiceMenuOptions(): StoredIndexedChoiceInterface[] | undefined {
        let d = GameUnifier.getVariable<any>(
            SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_MENU_OPTIONS_MEMORY_KEY
        ) as StoredChoiceInterface[];
        if (d) {
            let onlyHaveNoChoice: StoredIndexedChoiceInterface[] = [];
            let options: StoredIndexedChoiceInterface[] = d.map((option, index) => {
                return {
                    ...option,
                    choiceIndex: index,
                };
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
    public set choiceMenuOptions(
        options: (ChoiceMenuOption<any> | ChoiceMenuOptionClose | StoredChoiceInterface)[] | undefined
    ) {
        if (!options || options.length === 0) {
            GameUnifier.setVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_MENU_OPTIONS_MEMORY_KEY, undefined);
            return;
        }
        let value: StoredChoiceInterface[] = options.map((option) => {
            if (option instanceof ChoiceMenuOptionClose) {
                let temp: StoredChoiceInterface = {
                    ...option.devProps,
                    text: option.text,
                    type: Close,
                    closeCurrentLabel: option.closeCurrentLabel,
                    oneTime: option.oneTime,
                    onlyHaveNoChoice: option.onlyHaveNoChoice,
                    autoSelect: option.autoSelect,
                    props: option.props,
                };
                return temp;
            } else if (option instanceof ChoiceMenuOption) {
                let temp: StoredChoiceInterface = {
                    ...option.devProps,
                    type: option.type,
                    text: option.text,
                    label: option.label.id,
                    autoSelect: option.autoSelect,
                    oneTime: option.oneTime,
                    onlyHaveNoChoice: option.onlyHaveNoChoice,
                    props: option.props,
                };
                return temp;
            }
            return option;
        });
        try {
            GameUnifier.setVariable(
                SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_MENU_OPTIONS_MEMORY_KEY,
                createExportableElement(value) as any
            );
            GameUnifier.setVariable(
                SYSTEM_RESERVED_STORAGE_KEYS.LAST_MENU_OPTIONS_ADDED_IN_STEP_MEMORY_KEY,
                this.stepCounter
            );
        } catch (e) {
            logger.error("ChoiceInterface cannot contain functions or classes");
            throw e;
        }
    }
    public get dialogGlue(): boolean {
        return GameUnifier.getFlag(SYSTEM_RESERVED_STORAGE_KEYS.ADD_NEXT_DIALOG_TEXT_INTO_THE_CURRENT_DIALOG_FLAG_KEY);
    }
    public set dialogGlue(value: boolean) {
        GameUnifier.setFlag(SYSTEM_RESERVED_STORAGE_KEYS.ADD_NEXT_DIALOG_TEXT_INTO_THE_CURRENT_DIALOG_FLAG_KEY, value);
    }
    public get inputValue(): StorageElementType {
        return GameUnifier.getVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_INPUT_VALUE_MEMORY_KEY);
    }
    public set inputValue(value: StorageElementType) {
        this.removeInputRequest();
        GameUnifier.setVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_INPUT_VALUE_MEMORY_KEY, value);
        GameUnifier.setVariable(SYSTEM_RESERVED_STORAGE_KEYS.LAST_INPUT_ADDED_IN_STEP_MEMORY_KEY, this.stepCounter);
    }
    public get isRequiredInput(): boolean {
        return (
            GameUnifier.getVariable<InputInfo>(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_INPUT_INFO_MEMORY_KEY)
                ?.isRequired || false
        );
    }
    public get inputType(): string | undefined {
        return GameUnifier.getVariable<InputInfo>(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_INPUT_INFO_MEMORY_KEY)?.type;
    }
    public requestInput(info: Omit<InputInfo, "isRequired">, defaultValue?: StorageElementType) {
        (info as InputInfo).isRequired = true;
        GameUnifier.setVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_INPUT_INFO_MEMORY_KEY, info);
        if (defaultValue !== undefined) {
            GameUnifier.setVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_INPUT_VALUE_MEMORY_KEY, defaultValue);
        } else {
            GameUnifier.removeVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_INPUT_VALUE_MEMORY_KEY);
        }
    }
    public removeInputRequest() {
        GameUnifier.removeVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_INPUT_INFO_MEMORY_KEY);
        GameUnifier.removeVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_INPUT_VALUE_MEMORY_KEY);
    }

    public clear() {
        NarrationManagerStatic.openedLabels = [];
        NarrationManagerStatic._stepCounter = 0;
    }

    /* Export and Import Methods */

    public export(): NarrationGameState {
        return {
            openedLabels: createExportableElement(NarrationManagerStatic.openedLabels),
            stepCounter: this.stepCounter,
        };
    }

    private async onLoadingLabel(currentLabelStepIndex: number) {
        const promise = this.openedLabels.map(async (labelInfo) => {
            let res: (void | Promise<void>)[] = [];
            let label = RegisteredLabels.get(labelInfo.label);
            if (label) {
                if (label.onLoadingLabel) {
                    res.push(label.onLoadingLabel(currentLabelStepIndex, label));
                }
                if (NarrationManagerStatic.onLoadingLabel) {
                    res.push(NarrationManagerStatic.onLoadingLabel(currentLabelStepIndex, label));
                }
            }
            return await Promise.all(res);
        });
        return await Promise.all(promise);
    }
    public async restore(data: object, lastHistoryStep: Omit<HistoryStep, "diff"> | null) {
        this.clear();
        try {
            NarrationManagerStatic.lastHistoryStep = lastHistoryStep;
            if (data.hasOwnProperty("openedLabels")) {
                NarrationManagerStatic.openedLabels = (data as NarrationGameState)["openedLabels"];
                NarrationManagerStatic.originalOpenedLabels = NarrationManagerStatic.openedLabels;
            } else {
                logger.warn("Could not import openedLabels data, so will be ignored");
            }
            if (data.hasOwnProperty("stepCounter")) {
                NarrationManagerStatic._stepCounter = (data as NarrationGameState)["stepCounter"];
            } else if (data.hasOwnProperty("lastStepIndex")) {
                NarrationManagerStatic._stepCounter = (data as NarrationGameState)["lastStepIndex"] as number;
            } else {
                logger.warn("Could not import stepCounter data, so will be ignored");
            }

            try {
                await this.onLoadingLabel(NarrationManagerStatic.currentLabelStepIndex || 0);
            } catch (e) {
                logger.error("Error running onLoadingLabel", e);
            }
        } catch (e) {
            logger.error("Error importing data", e);
        }
    }
}
