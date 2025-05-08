declare module "@drincs/pixi-vn" {
    interface CharacterInterface {
        /**
         * The id of the character. It must be unique.
         */
        id: string;
        /**
         * The name of the character.
         */
        name: string;
        /**
         * The surname of the character.
         */
        surname?: string;
        /**
         * The age of the character.
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
        text: string;
        /**
         * Label Id to be opened when the option is selected
         */
        label?: LabelIdType | CloseType;
        /**
         * Type of the label to be opened
         */
        type: LabelRunModeType;
        /**
         * If this is true, the choice can only be made once.
         */
        oneTime: boolean;
        /**
         * If this is true, the choice can see only if there are no other choices. For example, all choices are one-time choices and they are already selected.
         */
        onlyHaveNoChoice: boolean;
        /**
         * If this is true and if is the only choice, it will be automatically selected, and call/jump to the label.
         */
        autoSelect: boolean;
        /**
         * If true, the current label will be closed
         */
        closeCurrentLabel?: boolean;
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
        [key: string]: any;
    }
}
