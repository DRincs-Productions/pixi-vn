declare module "@drincs/pixi-vn" {
    interface CharacterInterface {
        /**
         * The id of the character. It must be unique.
         */
        id: string;
        /**
         * The name of the character.
         * If you set undefined, it will return the default name.
         */
        name: string;
        /**
         * The surname of the character.
         * If you set undefined, it will return the default surname.
         */
        surname?: string;
        /**
         * The age of the character.
         * If you set undefined, it will return the default age.
         */
        age?: number;
        /**
         * The icon of the character.
         */
        readonly icon?: string;
        /**
         * The color of the character.
         */
        readonly color?: string;
    }
    interface DialogueInterface {
        /**
         * The text of the dialogue.
         */
        text: string | string[];
        /**
         * The id of the character that is speaking.
         */
        character?: CharacterInterface | string;
    }
    interface ChoiceInterface {
        /**
         * Text to be displayed in the menu
         */
        text: string | string[];
        /**
         * Label Id to be opened when the option is selected
         */
        label: LabelIdType | CloseType;
        /**
         * Type of the label to be opened
         */
        type: LabelRunModeType | CloseType;
        /**
         * If this is true, the choice can only be made once.
         */
        oneTime?: boolean;
        /**
         * If this is true, the choice can see only if there are no other choices. For example, all choices are one-time choices and they are already selected.
         */
        onlyHaveNoChoice?: boolean;
        /**
         * If this is true and if is the only choice, it will be automatically selected, and call/jump to the label.
         */
        autoSelect?: boolean;
        /**
         * If true, the current label will be closed
         */
        closeCurrentLabel?: boolean;
        /**
         * Properties to be passed to the label and olther parameters that you can use when get all the choice menu options.
         */
        props?: StorageObjectType;
    }
    interface StepLabelProps {
        [key: string]: any;
    }
    interface StepLabelResult {
        [key: string]: any;
    }
    interface GameStepState {
        [key: string]: any;
    }
    interface HistoryInfo {
        /**
         * The label id of the current step.
         */
        currentLabel?: LabelIdType;
        /**
         * The sha1 of the step function.
         */
        stepSha1: string;
        /**
         * Equivalent to the narration.stepCounter
         */
        index: number;
        /**
         * The data of the step of the label.
         */
        labelStepIndex: number | null;
        /**
         * @deprecated
         */
        dialoge?: StoredDialogue;
        /**
         * Dialogue to be shown in the game
         */
        dialogue?: StoredDialogue;
        /**
         * List of choices asked of the player
         */
        choices?: StoredChoiceInterface[];
        /**
         * List of choices already made by the player
         */
        alreadyMadeChoices?: number[];
        /**
         * The input value of the player
         */
        inputValue?: StorageElementType;
        /**
         * The choice made by the player
         */
        choiceIndexMade?: number;
        /**
         * If true, the current dialogue will be glued to the previous one.
         */
        isGlued?: boolean;
        /**
         * Number of labels opened in the current step.
         */
        openedLabels?: OpenedLabel[];
    }
}
