import { useEffect, useState } from "react";
import { testLabels } from "./labels/registry";

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
    const hasChoices = Boolean(state?.choices?.length);

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
            <div style={{ display: "grid", gap: 8 }}>
                <button disabled={!api || busy} onClick={() => run(() => api?.start("sandbox-start"))}>
                    Menu test
                </button>
                {testLabels
                    .filter((label) => label.id !== "sandbox-start")
                    .map((label) => (
                        <button
                            key={label.id}
                            disabled={!api || busy}
                            onClick={() => run(() => api?.start(label.id))}
                        >
                            Avvia: {label.title}
                        </button>
                    ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                <button disabled={!api || busy || !state?.canContinue || hasChoices} onClick={() => run(() => api?.continue())}>
                    Continue
                </button>
                <button disabled={!api || busy || !state?.canGoBack} onClick={() => run(() => api?.goBack())}>
                    Indietro
                </button>
                <button disabled={!api || busy} onClick={() => { api?.closeCurrentLabel(); refresh(); }}>
                    Chiudi label
                </button>
            </div>

            {state?.choices?.map((choice) => (
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
