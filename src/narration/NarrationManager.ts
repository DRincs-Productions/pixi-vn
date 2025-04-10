import { CharacterInterface } from "@drincs/pixi-vn";
import { SYSTEM_RESERVED_STORAGE_KEYS } from "../constants";
import { StorageElementType } from "../storage";
import GameUnifier from "../unifier";
import { logger } from "../utils/log-utility";
import ChoiceMenuOption, { ChoiceMenuOptionClose, IStoratedChoiceMenuOption } from "./classes/ChoiceMenuOption";
import newCloseLabel, { CLOSE_LABEL_ID } from "./classes/CloseLabel";
import Dialogue from "./classes/Dialogue";
import Label from "./classes/Label";
import LabelAbstract from "./classes/LabelAbstract";
import { getLabelById } from "./decorators/label-decorator";
import HistoryStep, { AdditionalShaSpetsEnum } from "./interfaces/HistoryStep";
import NarrationGameState from "./interfaces/NarrationGameState";
import NarrationManagerInterface from "./interfaces/NarrationManagerInterface";
import NarrationManagerStatic from "./NarrationManagerStatic";
import { ChoiceMenuOptionsType } from "./types/ChoiceMenuOptionsType";
import ChoicesMadeType from "./types/ChoicesMadeType";
import { Close } from "./types/CloseType";
import DialogueType from "./types/DialogueType";
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
        return NarrationManagerStatic._openedLabels;
    }
    get currentLabel(): Label | undefined {
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
            choiseMade?: number;
            ignoreSameStep?: boolean;
        } = {}
    ) {
        const { choiseMade, ignoreSameStep } = options;
        let dialoge: Dialogue | undefined = undefined;
        let requiredChoices: IStoratedChoiceMenuOption[] | undefined = undefined;
        let inputValue: StorageElementType | undefined = undefined;
        if (
            GameUnifier.getVariable<number>(SYSTEM_RESERVED_STORAGE_KEYS.LAST_DIALOGUE_ADDED_IN_STEP_MEMORY_KEY) ===
            this.stepCounter
        ) {
            dialoge = this.dialogue;
        }
        if (
            GameUnifier.getVariable<number>(SYSTEM_RESERVED_STORAGE_KEYS.LAST_MENU_OPTIONS_ADDED_IN_STEP_MEMORY_KEY) ===
            this.stepCounter
        ) {
            requiredChoices = GameUnifier.getVariable<IStoratedChoiceMenuOption[]>(
                SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_MENU_OPTIONS_MEMORY_KEY
            );
        }
        if (
            GameUnifier.getVariable<StorageElementType>(
                SYSTEM_RESERVED_STORAGE_KEYS.LAST_INPUT_ADDED_IN_STEP_MEMORY_KEY
            ) === this.stepCounter
        ) {
            inputValue = GameUnifier.getVariable<IStoratedChoiceMenuOption[]>(
                SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_INPUT_VALUE_MEMORY_KEY
            );
        }
        let historyInfo: Omit<HistoryStep, "diff"> = {
            currentLabel: NarrationManagerStatic.currentLabelId,
            dialoge: dialoge,
            choices: requiredChoices,
            stepSha1: stepSha,
            index: this.stepCounter,
            labelStepIndex: NarrationManagerStatic.currentLabelStepIndex,
            choiceIndexMade: choiseMade,
            inputValue: inputValue,
            alreadyMadeChoices: this.alreadyCurrentStepMadeChoices,
        };
        NarrationManagerStatic.originalOpenedLabels = NarrationManagerStatic._openedLabels;
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
        NarrationManagerStatic._openedLabels.pop(); //
        GameUnifier.onLabelClosing(this.openedLabels.length);
    }
    closeAllLabels() {
        while (NarrationManagerStatic._openedLabels.length > 0) {
            this.closeCurrentLabel();
            GameUnifier.onLabelClosing(this.openedLabels.length);
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
        if (currentLabel.stepCount > currentLabelStepIndex) {
            this.addStepHistory(AdditionalShaSpetsEnum.DEVELOPER, { ignoreSameStep: true });
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
            if (currentLabel.stepCount > currentLabelStepIndex) {
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
                        this.addStepHistory(stepSha, {
                            ...options,
                            choiseMade: NarrationManagerStatic.choiseMadeTemp,
                        });
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
                NarrationManagerStatic._openedLabels = NarrationManagerStatic.originalOpenedLabels;
                if (this.onGameEnd) {
                    return await this.onGameEnd(props, { labelId: "end" });
                }
                return;
            }
        } else if (this.openedLabels.length === 0) {
            NarrationManagerStatic._openedLabels = NarrationManagerStatic.originalOpenedLabels;
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
        props: StepLabelPropsType<T>,
        options?: {
            /**
             * The index of the choise made by the player. (This params is used in the choice menu)
             */
            choiseMade?: number;
        }
    ): Promise<StepLabelResultType> {
        const { choiseMade } = options || {};
        let labelId: LabelIdType;
        if (typeof label === "string") {
            labelId = label;
        } else {
            labelId = label.id;
        }
        try {
            if (labelId === CLOSE_LABEL_ID) {
                let closeCurrentLabel = newCloseLabel<T>();
                let choice: ChoiceMenuOptionClose<T> = {
                    label: closeCurrentLabel,
                    text: "",
                    closeCurrentLabel: false,
                    type: "close",
                    oneTime: false,
                    onlyHaveNoChoice: false,
                    autoSelect: false,
                    props: {},
                    choiseIndex: choiseMade,
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
            NarrationManagerStatic.pushNewLabel(tempLabel.id); //
        } catch (e) {
            logger.error("Error calling label", e);
            return;
        }
        return await this.runCurrentStep<T>(props, { choiseMade: choiseMade });
    }
    public async jumpLabel<T extends {}>(
        label: Label<T> | LabelIdType,
        props: StepLabelPropsType<T>,
        options?: {
            /**
             * The index of the choise made by the player. (This params is used in the choice menu)
             */
            choiseMade?: number;
        }
    ): Promise<StepLabelResultType> {
        this.closeCurrentLabel();
        const { choiseMade } = options || {};
        let labelId: LabelIdType;
        if (typeof label === "string") {
            labelId = label;
        } else {
            labelId = label.id;
        }
        try {
            if (labelId === CLOSE_LABEL_ID) {
                let closeCurrentLabel = newCloseLabel<T>();
                let choice: ChoiceMenuOptionClose<T> = {
                    label: closeCurrentLabel,
                    text: "",
                    closeCurrentLabel: false,
                    type: "close",
                    oneTime: false,
                    onlyHaveNoChoice: false,
                    autoSelect: false,
                    props: {},
                    choiseIndex: choiseMade,
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
            NarrationManagerStatic.pushNewLabel(tempLabel.id); //
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
            return await this.callLabel(
                item.label,
                { ...item.props, ...props },
                {
                    choiseMade: item.choiseIndex,
                }
            );
        } else if (item.type == "jump") {
            return (
                await this.jumpLabel(item.label, { ...item.props, ...props }),
                {
                    choiseMade: item.choiseIndex,
                }
            );
        } else if (item.type == "close") {
            return await this.closeChoiceMenu(item, { ...item.props, ...props });
        } else {
            throw new Error(`[Pixi’VN] Type ${item.type} not found`);
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
        choice: ChoiceMenuOptionClose<T>,
        props: StepLabelPropsType<T>
    ): Promise<StepLabelResultType> {
        let choiseMade: number | undefined = undefined;
        if (typeof choice.choiseIndex === "number") {
            choiseMade = choice.choiseIndex;
        }
        if (choice.closeCurrentLabel) {
            this.closeCurrentLabel();
        }
        return this.goNext(props, { choiseMade: choiseMade });
    }

    /* Go Back & Refresh Methods */

    public onGameEnd: StepLabelType | undefined = undefined;
    public onStepError: ((error: any, props: StepLabelPropsType) => void) | undefined = undefined;

    public get dialogue(): Dialogue | undefined {
        return GameUnifier.getVariable<DialogueType>(
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
            GameUnifier.setVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_DIALOGUE_MEMORY_KEY, undefined);
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
            let glueDialogue = GameUnifier.getVariable<DialogueType>(
                SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_DIALOGUE_MEMORY_KEY
            ) as Dialogue;
            if (glueDialogue) {
                dialogue.text = `${glueDialogue.text}${dialogue.text}`;
                dialogue.character = dialogue.character || glueDialogue.character;
            }
            this.dialogGlue = false;
        }

        GameUnifier.setVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_DIALOGUE_MEMORY_KEY, dialogue as DialogueType);
        GameUnifier.setVariable(SYSTEM_RESERVED_STORAGE_KEYS.LAST_DIALOGUE_ADDED_IN_STEP_MEMORY_KEY, this.stepCounter);
    }
    public get choiceMenuOptions(): ChoiceMenuOptionsType<any> | undefined {
        let d = GameUnifier.getVariable<IStoratedChoiceMenuOption[]>(
            SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_MENU_OPTIONS_MEMORY_KEY
        );
        if (d) {
            let options: ChoiceMenuOptionsType = [];
            let onlyHaveNoChoice: ChoiceMenuOptionsType = [];
            d.forEach((option, index) => {
                if (option.type === Close) {
                    let itemLabel = newCloseLabel();
                    let choice = new ChoiceMenuOptionClose(option.text, {
                        closeCurrentLabel: option.closeCurrentLabel,
                        oneTime: option.oneTime,
                        onlyHaveNoChoice: option.onlyHaveNoChoice,
                        autoSelect: option.autoSelect,
                        choiseIndex: index,
                    });
                    choice.label = itemLabel;
                    options.push(choice);
                    return;
                }
                let label = getLabelById(option.label);
                if (label) {
                    options.push(
                        new ChoiceMenuOption(option.text, label, option.props, {
                            type: option.type,
                            oneTime: option.oneTime,
                            onlyHaveNoChoice: option.onlyHaveNoChoice,
                            autoSelect: option.autoSelect,
                            choiseIndex: index,
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
            GameUnifier.setVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_MENU_OPTIONS_MEMORY_KEY, undefined);
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
        GameUnifier.setVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_MENU_OPTIONS_MEMORY_KEY, value);
        GameUnifier.setVariable(
            SYSTEM_RESERVED_STORAGE_KEYS.LAST_MENU_OPTIONS_ADDED_IN_STEP_MEMORY_KEY,
            this.stepCounter
        );
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
        NarrationManagerStatic._openedLabels = [];
        NarrationManagerStatic._stepCounter = 0;
    }

    /* Export and Import Methods */

    public export(): NarrationGameState {
        return {
            openedLabels: NarrationManagerStatic._openedLabels,
            stepCounter: this.stepCounter,
        };
    }
    public async restore(data: object, lastHistoryStep: HistoryStep | null) {
        this.clear();
        try {
            NarrationManagerStatic.lastHistoryStep = lastHistoryStep;
            if (data.hasOwnProperty("openedLabels")) {
                NarrationManagerStatic._openedLabels = (data as NarrationGameState)["openedLabels"];
                NarrationManagerStatic.originalOpenedLabels = NarrationManagerStatic._openedLabels;
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
