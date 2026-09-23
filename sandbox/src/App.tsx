import { useEffect, useMemo, useState } from "react";
import { testLabels, type TestLabelEntry } from "./labels/registry";
import { START_LABEL_ID } from "./labels/start";

type TestingApi = {
    start: (label: string) => Promise<unknown>;
    continue: () => Promise<unknown>;
    goBack: () => Promise<unknown>;
    selectChoice: (choiceIndex: number) => Promise<unknown>;
    closeCurrentLabel: () => void;
    getState: () => {
        currentLabelId?: string;
        dialogue?: { text?: string };
        choices?: { choiceIndex: number; text: string }[];
        canContinue: boolean;
        canGoBack: boolean;
    };
    errors: unknown[];
};

function getTestingApi() {
    return (window as any).pixiVN as TestingApi | undefined;
}

export default function App() {
    const [state, setState] = useState<ReturnType<TestingApi["getState"]>>();
    const [errors, setErrors] = useState<unknown[]>([]);
    const [busy, setBusy] = useState(false);

    const refresh = () => {
        const api = getTestingApi();
        if (api) {
            setState(api.getState());
            setErrors(api.errors);
        }
    };

    useEffect(() => {
        refresh();
        const interval = window.setInterval(refresh, 250);
        return () => window.clearInterval(interval);
    }, []);

    const run = async (action: () => Promise<unknown> | unknown) => {
        setBusy(true);
        try {
            await action();
        } finally {
            refresh();
            setBusy(false);
        }
    };

    const api = getTestingApi();

    // Every registered label already shows up as a choice on the "sandbox-start" screen (see
    // labels/start.ts) - only render the generic choices list below when it's showing something
    // *other* than that same menu, to avoid listing every label twice.
    const showChoices = Boolean(state?.choices?.length) && state?.currentLabelId !== START_LABEL_ID;

    const categories = useMemo(() => {
        const byCategory = new Map<string, TestLabelEntry[]>();
        for (const label of testLabels) {
            if (label.id === START_LABEL_ID) {
                continue;
            }
            const group = byCategory.get(label.category);
            if (group) {
                group.push(label);
            } else {
                byCategory.set(label.category, [label]);
            }
        }
        return byCategory;
    }, []);

    return (
        <aside
            style={{
                position: "fixed",
                top: 16,
                left: 16,
                zIndex: 10,
                pointerEvents: "auto",
                width: 320,
                maxHeight: "calc(100vh - 32px)",
                overflowY: "auto",
                padding: 16,
                color: "#f7f2e8",
                background: "rgba(20, 24, 32, 0.94)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: 8,
                fontFamily: "system-ui, sans-serif",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.35)",
            }}
        >
            <h1 style={{ margin: "0 0 12px", fontSize: 18 }}>Pixi&apos;VN sandbox</h1>
            <button
                disabled={!api || busy}
                onClick={() => run(() => api?.start(START_LABEL_ID))}
                style={{ width: "100%" }}
            >
                Menu test
            </button>

            <div style={{ display: "grid", gap: 4, marginTop: 8 }}>
                {Array.from(categories.entries()).map(([category, labels]) => (
                    <details key={category}>
                        <summary style={{ cursor: "pointer", padding: "4px 0" }}>
                            {category} ({labels.length})
                        </summary>
                        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                            {labels.map((label) => (
                                <button
                                    key={label.id}
                                    disabled={!api || busy}
                                    onClick={() => run(() => api?.start(label.id))}
                                >
                                    Avvia: {label.title}
                                </button>
                            ))}
                        </div>
                    </details>
                ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                <button disabled={!api || busy || !state?.canContinue || showChoices} onClick={() => run(() => api?.continue())}>
                    Continue
                </button>
                <button disabled={!api || busy || !state?.canGoBack} onClick={() => run(() => api?.goBack())}>
                    Indietro
                </button>
                <button disabled={!api || busy} onClick={() => { api?.closeCurrentLabel(); refresh(); }}>
                    Chiudi label
                </button>
            </div>

            {showChoices &&
                state?.choices?.map((choice) => (
                    <button
                        key={choice.choiceIndex}
                        disabled={!api || busy}
                        onClick={() => run(() => api?.selectChoice(choice.choiceIndex))}
                        style={{ display: "block", width: "100%", marginTop: 8 }}
                    >
                        {choice.text}
                    </button>
                ))}

            <p style={{ margin: "14px 0 4px", fontSize: 12, opacity: 0.7 }}>
                {state?.currentLabelId ?? "In attesa del bridge..."}
            </p>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.4 }}>
                {state?.dialogue?.text ?? "Nessun dialogo attivo."}
            </p>
            {errors.length > 0 && (
                <p style={{ margin: "12px 0 0", color: "#ff9c8f", fontSize: 12 }}>
                    Errori testing: {errors.length}
                </p>
            )}
        </aside>
    );
}
