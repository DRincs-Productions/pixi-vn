// Simulates a third-party library extending Pixi'VN's save state through module augmentation
// against the public root import.
import { Game, type GameState } from "@drincs/pixi-vn";

declare module "@drincs/pixi-vn" {
    interface GameState {
        myLibraryData?: { score: number };
    }
}

Game.addOnExportGameState((state) => {
    state.myLibraryData = { score: 10 };
});

Game.addOnRestoreGameState(
    (state) => {
        const score: number | undefined = state.myLibraryData?.score;
        void score;
    },
    { timing: "after" },
);

export async function check(): Promise<GameState> {
    const state = await Game.exportGameState();
    // Custom property is typed.
    const score: number | undefined = state.myLibraryData?.score;
    // Built-in properties are still there.
    const version: string = state.pixivn_version;
    const path: string = state.path;
    void [
        score,
        version,
        path,
        state.stepData,
        state.storageData,
        state.canvasData,
        state.soundData,
        state.historyData,
    ];
    return state;
}

// @ts-expect-error - augmentation must not turn GameState into `any`.
export const wrong: GameState["myLibraryData"] = { score: "not a number" };
