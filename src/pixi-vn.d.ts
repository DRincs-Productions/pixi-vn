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
