import type OnErrorHandler from "@core/OnErrorHandler";
import * as historyUtils from "@drincs/pixi-vn/history";
import * as narrationUtils from "@drincs/pixi-vn/narration";
import * as storageUtils from "@drincs/pixi-vn/storage";
import { logger } from "@utils/log-utility";

/**
 * One error captured by {@link createGameTesting}'s `enable` while testing is active, via
 * `Game.addOnError`.
 */
export interface GameTestingErrorEntry {
    error: unknown;
    timestamp: number;
}

/**
 * A read-only snapshot of everything a test session typically needs to decide its next
 * action, gathered from {@link narrationUtils.narration} and {@link historyUtils.stepHistory}
 * in a single call instead of reading several properties one by one.
 */
export interface GameTestingState {
    dialogue: narrationUtils.DialogueInterface | undefined;
    dialogueGlue: boolean;
    choices: narrationUtils.StoredIndexedChoiceInterface[] | undefined;
    input: {
        isRequired: boolean;
        type: string | undefined;
        value: storageUtils.StorageElementType;
    };
    canContinue: boolean;
    canGoBack: boolean;
    labelsOpened: narrationUtils.OpenedLabel[];
    currentLabelId: string | undefined;
    stepCounter: number;
}

/**
 * The object attached to `window` (and returned) by `enable`. Every action method
 * merges the most recent props passed to `setProps` with any `extraProps` given here,
 * then delegates to the matching narration/history call — so calling these behaves exactly
 * like a real player action (the same `navigate`/`t`/`toast`/etc. the real UI uses).
 *
 * `narration`, `storage`, `stepHistory` and `Game` are also exposed directly for anything not
 * covered by the action methods (e.g. `storage.set(...)`, `Game.exportGameState()`).
 */
export interface GameTestingAPI<TGame, T extends {} = {}> {
    readonly Game: TGame;
    readonly narration: narrationUtils.NarrationManagerInterface;
    readonly storage: storageUtils.StorageManagerInterface;
    readonly stepHistory: historyUtils.HistoryManagerInterface;
    /**
     * The most recent props passed to `setProps` — whatever your app's `StepLabelProps`
     * augmentation defines (e.g. `navigate`, `toast`). Useful to drive the app's UI directly
     * during a test session — e.g. `pixiVN.props.navigate("/settings")` — not just narration,
     * for full control over what's on screen.
     */
    readonly props: narrationUtils.StepLabelPropsType<T>;
    /** `Game.start` using the live props plus any `extraProps`. */
    start(
        label: narrationUtils.LabelAbstract<any, T> | narrationUtils.LabelIdType,
        extraProps?: Partial<T>,
    ): Promise<narrationUtils.StepLabelResultType>;
    /** {@link narrationUtils.NarrationManagerInterface.continue} using the live props plus any `extraProps`. */
    continue(
        extraProps?: Partial<T>,
        options?: { steps?: number; runNow?: boolean },
    ): Promise<narrationUtils.StepLabelResultType>;
    /** {@link narrationUtils.NarrationManagerInterface.call} using the live props plus any `extraProps`. */
    call(
        label: narrationUtils.LabelAbstract<any, T> | narrationUtils.LabelIdType,
        extraProps?: Partial<T>,
    ): Promise<narrationUtils.StepLabelResultType>;
    /** {@link narrationUtils.NarrationManagerInterface.jump} using the live props plus any `extraProps`. */
    jump(
        label: narrationUtils.LabelAbstract<any, T> | narrationUtils.LabelIdType,
        extraProps?: Partial<T>,
    ): Promise<narrationUtils.StepLabelResultType>;
    /**
     * Selects the currently open choice with this `choiceIndex` (as seen in
     * `getState().choices`), using the live props plus any `extraProps`.
     * @throws when no open choice has that index.
     */
    selectChoice(
        choiceIndex: number,
        extraProps?: Partial<T>,
    ): Promise<narrationUtils.StepLabelResultType>;
    /** Resolves a pending `narration.input.request(...)` with `value`, exactly like the player typing an answer and confirming. */
    setInput(value: storageUtils.StorageElementType): void;
    /** {@link historyUtils.HistoryManagerInterface.back} using the live props plus any `extraProps`. */
    goBack(
        extraProps?: Partial<T>,
        options?: { steps?: number },
    ): Promise<narrationUtils.StepLabelResultType>;
    /** {@link narrationUtils.NarrationLabelsInterface.closeCurrent} */
    closeCurrentLabel(): void;
    /** {@link narrationUtils.NarrationLabelsInterface.closeAll}. **Can end the game.** */
    closeAllLabels(): void;
    /** A snapshot of dialogue/choices/input/canContinue/canGoBack/labels — see {@link GameTestingState}. */
    getState(): GameTestingState;
    /** Errors caught via `Game.addOnError` since `enable()` was called (or since the last {@link clearErrors}). */
    readonly errors: GameTestingErrorEntry[];
    clearErrors(): void;
}

/**
 * Per-action overrides an app can register via `setActions` so `Game.testing`'s
 * window-exposed actions run the app's own narration functions — with whatever UI-only side
 * effects they add (loading state, blocking while a menu is open, refreshing cached interface
 * data, ...) — instead of calling {@link narrationUtils.narration} / {@link
 * historyUtils.stepHistory} directly. Any action left undefined keeps the default behavior.
 *
 * `continue`/`back` take no arguments: the `extraProps`/`options` a caller passes to the
 * corresponding {@link GameTestingAPI} method are ignored when an override is registered,
 * since the override already has its own way to gather props (and typically doesn't support
 * stepped/replay options). `selectChoice` receives the resolved choice item instead of the
 * raw `choiceIndex`, since looking it up is already handled before the override runs.
 */
export interface GameTestingActions<T extends {} = {}> {
    continue?: () => Promise<void>;
    back?: () => Promise<void>;
    selectChoice?: (item: narrationUtils.StoredIndexedChoiceInterface) => Promise<void>;
    start?: (
        label: narrationUtils.LabelAbstract<any, T> | narrationUtils.LabelIdType,
        props?: T,
    ) => Promise<void>;
    jump?: (
        label: narrationUtils.LabelAbstract<any, T> | narrationUtils.LabelIdType,
        props?: T,
    ) => Promise<narrationUtils.StepLabelResultType>;
    call?: (
        label: narrationUtils.LabelAbstract<any, T> | narrationUtils.LabelIdType,
        props?: T,
    ) => Promise<narrationUtils.StepLabelResultType>;
}

/** The subset of `Game` a testing session needs to drive narration and surface errors. */
interface TestableGame {
    start<T extends {} = {}>(
        label: narrationUtils.LabelAbstract<any, T> | narrationUtils.LabelIdType,
        props: narrationUtils.StepLabelPropsType<T>,
    ): Promise<narrationUtils.StepLabelResultType>;
    addOnError(handler: OnErrorHandler): unknown;
    removeOnError(handler: OnErrorHandler): void;
}

interface ActiveSession<TGame> {
    api: GameTestingAPI<TGame, any>;
    windowKey: string;
    errorHandler: OnErrorHandler;
}

/**
 * Builds the `Game.testing` API bound to `Game`. Kept in its own module so it can be typed and
 * read independently of `Game`'s other members; `Game` just exposes the result as `Game.testing`.
 */
export function createGameTesting<TGame extends TestableGame>(Game: TGame) {
    let active: ActiveSession<TGame> | undefined;

    /**
     * The most recent props passed to `setProps`, used by every {@link GameTestingAPI}
     * action. Kept even while disabled, so a session started later already has fresh props.
     */
    let currentProps: {} = {};

    /**
     * The most recent actions passed to `setActions`, used by every {@link GameTestingAPI}
     * action that has a matching override. Kept even while disabled, same as `currentProps`.
     */
    let currentActions: GameTestingActions<any> = {};

    /**
     * Updates the live props every {@link GameTestingAPI} action merges `extraProps` on top of.
     * Call this unconditionally from wherever your app builds its `StepLabelProps` (e.g. the end
     * of a `useGameProps()`-style hook that already runs throughout the app) — it's a cheap
     * assignment, safe to call whether or not testing is currently `enable`d.
     * @param props The app's current `StepLabelProps` (the same object your UI passes to
     * `narration.continue`/`Game.start`).
     */
    function setProps<T extends {} = {}>(props: narrationUtils.StepLabelPropsType<T>): void {
        currentProps = props;
    }

    /**
     * Registers the app's own narration functions so {@link GameTestingAPI}'s `continue`,
     * `goBack`, `selectChoice`, `start`, `jump` and `call` call them instead of going straight to
     * `narration`/`stepHistory` — useful when the app wraps those with UI-only concerns (e.g. a
     * loading indicator, blocking while a menu is open, refreshing cached interface data) that a
     * test session driving the game through `window` should also go through, exactly like a real
     * player action would. Safe to call whether or not testing is currently `enable`d, and
     * safe to call again to update the registered functions (e.g. when they close over fresh
     * props). Persists across `disable`/`enable`, same as `setProps`.
     * @param actions The app's own narration functions to use in place of the defaults. Pass `{}`
     * (or omit an action) to keep/restore the default behavior for that action.
     */
    function setActions<T extends {} = {}>(actions: GameTestingActions<T>): void {
        currentActions = actions;
    }

    /**
     * Enables the testing API: builds it, attaches it to `window[windowKey]` (default
     * `"pixiVN"`), and returns it. Calling this again replaces the previous session.
     * @param options.windowKey The property name to attach the API under on `window`. @default "pixiVN"
     */
    function enable<T extends {} = {}>(options?: { windowKey?: string }): GameTestingAPI<TGame, T> {
        if (active) {
            disable();
        }

        const windowKey = options?.windowKey ?? "pixiVN";
        const errors: GameTestingErrorEntry[] = [];
        const mergeProps = (extraProps?: Partial<T>) =>
            ({
                ...currentProps,
                ...extraProps,
            }) as narrationUtils.StepLabelPropsType<T>;

        const api: GameTestingAPI<TGame, T> = {
            Game,
            narration: narrationUtils.narration,
            storage: storageUtils.storage,
            stepHistory: historyUtils.stepHistory,
            get props() {
                return currentProps as narrationUtils.StepLabelPropsType<T>;
            },
            start: (label, extraProps) =>
                currentActions.start
                    ? currentActions.start(label, extraProps)
                    : Game.start(label, mergeProps(extraProps)),
            continue: (extraProps, options) =>
                currentActions.continue
                    ? currentActions.continue()
                    : narrationUtils.narration.continue(mergeProps(extraProps), options),
            call: (label, extraProps) =>
                currentActions.call
                    ? currentActions.call(label, extraProps)
                    : narrationUtils.narration.call(label, mergeProps(extraProps)),
            jump: (label, extraProps) =>
                currentActions.jump
                    ? currentActions.jump(label, extraProps)
                    : narrationUtils.narration.jump(label, mergeProps(extraProps)),
            selectChoice: (choiceIndex, extraProps) => {
                const item = narrationUtils.narration.choices.list?.find(
                    (choice) => choice.choiceIndex === choiceIndex,
                );
                if (!item) {
                    const available =
                        narrationUtils.narration.choices.list
                            ?.map((choice) => choice.choiceIndex)
                            .join(", ") ?? "none (no choice menu is open)";
                    throw new Error(
                        `Game.testing: no open choice with index ${choiceIndex}. Available: ${available}`,
                    );
                }
                return currentActions.selectChoice
                    ? currentActions.selectChoice(item)
                    : narrationUtils.narration.choices.select(item, mergeProps(extraProps));
            },
            setInput: (value) => {
                narrationUtils.narration.input.value = value;
            },
            goBack: (extraProps, options) =>
                currentActions.back
                    ? currentActions.back()
                    : historyUtils.stepHistory.back(mergeProps(extraProps), options),
            closeCurrentLabel: () => narrationUtils.narration.labels.closeCurrent(),
            closeAllLabels: () => narrationUtils.narration.labels.closeAll(),
            getState: () => ({
                dialogue: narrationUtils.narration.dialogue,
                dialogueGlue: narrationUtils.narration.dialogGlue,
                choices: narrationUtils.narration.choices.list,
                input: {
                    isRequired: narrationUtils.narration.input.isRequired,
                    type: narrationUtils.narration.input.type,
                    value: narrationUtils.narration.input.value,
                },
                canContinue: narrationUtils.narration.canContinue,
                canGoBack: historyUtils.stepHistory.canGoBack,
                labelsOpened: narrationUtils.narration.labels.opened,
                currentLabelId: narrationUtils.narration.labels.current?.id,
                stepCounter: narrationUtils.narration.stepCounter,
            }),
            get errors() {
                return errors.slice();
            },
            clearErrors: () => {
                errors.length = 0;
            },
        };

        const errorHandler: OnErrorHandler = (error) => {
            errors.push({ error, timestamp: Date.now() });
        };
        Game.addOnError(errorHandler);

        if (typeof window !== "undefined") {
            (window as unknown as Record<string, unknown>)[windowKey] = api;
        } else {
            logger.warn(
                `Game.testing.enable(): "window" is not defined, so the API was not attached globally (it was still returned).`,
            );
        }

        active = { api, windowKey, errorHandler };
        return api;
    }

    /**
     * Disables a session started with `enable`: removes the error handler and, if it's
     * still the current value, deletes `window[windowKey]`. No-op if testing isn't enabled.
     */
    function disable() {
        if (!active) {
            return;
        }
        Game.removeOnError(active.errorHandler);
        if (
            typeof window !== "undefined" &&
            (window as unknown as Record<string, unknown>)[active.windowKey] === active.api
        ) {
            delete (window as unknown as Record<string, unknown>)[active.windowKey];
        }
        active = undefined;
    }

    /** Whether a testing session is currently active. */
    function isEnabled(): boolean {
        return active !== undefined;
    }

    return { setProps, setActions, enable, disable, isEnabled };
}
