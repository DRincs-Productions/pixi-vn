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
        /**
         * The browser path that occurred during the progression of the steps.
         */
        path: string;
        /**
         * The storage that occurred during the progression of the steps.
         */
        storage: ExportedStorage;
        /**
         * The index of the label that occurred during the progression of the steps.
         */
        labelIndex: number;
        /**
         * The canvas that occurred during the progression of the steps.
         */
        canvas: ExportedCanvas;
        /**
         * The opened labels that occurred during the progression of the steps.
         */
        openedLabels: OpenedLabel[];
        /**
         * The sound data that occurred during the progression of the steps.
         */
        sound: ExportedSounds;
    }
}
