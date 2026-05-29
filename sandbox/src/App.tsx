import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { Game, newLabel } from "@drincs/pixi-vn";

const startLabel = newLabel("start", [
    ({ narration }) => {
        narration.dialogue = { character: "Alice", text: "**Hello!** This is _pixi-vn_ in Sandpack." };
    },
    ({ narration }) => {
        narration.dialogue = { character: "Alice", text: "Working! 🎉" };
    },
]);

export default function App() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [dialogue, setDialogue] = useState<string>("");
    const [started, setStarted] = useState(false);
    const [log, setLog] = useState<string[]>(["Importing @drincs/pixi-vn..."]);

    useEffect(() => {
        setLog((p) => [...p, "✓ Import OK"]);
    }, []);

    async function handleStart() {
        if (!canvasRef.current) return;
        try {
            await Game.init(canvasRef.current, { width: 480, height: 270 });
            await Game.start(startLabel, {
                onStepEnd: (_, narration) => {
                    const d = narration.dialogue;
                    setDialogue(typeof d === "object" && d ? String(d.text ?? "") : "");
                },
            });
            setStarted(true);
            setLog((p) => [...p, "✓ Game.init + start OK"]);
        } catch (e: any) {
            setLog((p) => [...p, `✗ ${e?.message ?? e}`]);
        }
    }

    async function handleContinue() {
        try {
            await Game.narration.continue(() => {});
            setLog((p) => [...p, "✓ continue OK"]);
        } catch (e: any) {
            setLog((p) => [...p, `✗ ${e?.message ?? e}`]);
        }
    }

    return (
        <div style={{ fontFamily: "monospace", padding: 16 }}>
            <h2>pixi-vn sandbox</h2>
            <div ref={canvasRef} style={{ border: "1px solid #ccc", marginBottom: 8 }} />
            {dialogue && (
                <div style={{ background: "#f0f0f0", padding: 8, marginBottom: 8 }}>
                    <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                        {dialogue}
                    </ReactMarkdown>
                </div>
            )}
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <button onClick={handleStart} disabled={started}>Init + Start</button>
                <button onClick={handleContinue} disabled={!started}>Continue</button>
            </div>
            <pre style={{ background: "#f4f4f4", padding: 8, minHeight: 60, fontSize: 12 }}>
                {log.join("\n")}
            </pre>
        </div>
    );
}
