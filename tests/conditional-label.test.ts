import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { narration, newLabel, stepHistory, storage } from "../src";

const talkAliceQuest = newLabel("talk-alice-cond", () => {
    if (storage.getFlag("test") === false) {
        return [
            async () => {
                narration.dialogue = {
                    character: "alice",
                    text: "Hi, can you order me a new book from pc?",
                };
            },
            () => {
                narration.dialogue = { character: "mc", text: "Ok" };
            },
            () => {
                narration.dialogue = { character: "alice", text: "Thanks" };
            },
            async (props) => {
                storage.setFlag("test", true);
                await narration.continue(props);
            },
        ];
    } else if (storage.getFlag("test") === true) {
        return [
            async () => {
                narration.dialogue = {
                    character: "mc",
                    text: "What book do you want me to order?",
                };
            },
            () => {
                narration.dialogue = { character: "alice", text: "For me it is the same." };
            },
        ];
    }
    return [
        () => {
            narration.dialogue = { character: "alice", text: "Thanks for the book." };
        },
    ];
});

beforeEach(() => {
    narration.clear();
    storage.clear();
    stepHistory.clear();
});

afterEach(() => {
    vi.restoreAllMocks();
});

test("first visit plays all 4 steps, sets flag, and closes the label automatically", async () => {
    const warnSpy = vi.spyOn(console, "warn");

    await narration.call(talkAliceQuest, {});
    expect(narration.dialogue?.text).toBe("Hi, can you order me a new book from pc?");

    await narration.continue({});
    expect(narration.dialogue?.text).toBe("Ok");

    await narration.continue({});
    expect(narration.dialogue?.text).toBe("Thanks");

    // Step 3 sets the flag and queues a continue; the label should auto-close.
    await narration.continue({});
    expect(narration.openedLabels).toEqual([]);
    // Dialogue stays at the last visible line
    expect(narration.dialogue?.text).toBe("Thanks");
    expect(storage.getFlag("test")).toBe(true);

    // No "stepSha not found" warning should have fired
    const stepShaWarnings = warnSpy.mock.calls.filter((args) =>
        String(args[0]).includes("stepSha not found"),
    );
    expect(stepShaWarnings).toHaveLength(0);
});

test("second visit shows the second branch", async () => {
    // Seed flag so we enter the second branch directly
    storage.setFlag("test", true);

    await narration.call(talkAliceQuest, {});
    expect(narration.dialogue?.text).toBe("What book do you want me to order?");

    await narration.continue({});
    expect(narration.dialogue?.text).toBe("For me it is the same.");

    // Label ends after the second step
    await narration.continue({});
    expect(narration.openedLabels).toEqual([]);
});

test("back navigation within first branch restores dialogue correctly", async () => {
    await narration.call(talkAliceQuest, {});
    expect(narration.dialogue?.text).toBe("Hi, can you order me a new book from pc?");

    await narration.continue({});
    expect(narration.dialogue?.text).toBe("Ok");

    await stepHistory.back({});
    expect(narration.dialogue?.text).toBe("Hi, can you order me a new book from pc?");

    // Can continue forward again
    await narration.continue({});
    expect(narration.dialogue?.text).toBe("Ok");

    await narration.continue({});
    expect(narration.dialogue?.text).toBe("Thanks");
});

test("full playthrough: first visit then second visit, no stepSha warnings", async () => {
    const warnSpy = vi.spyOn(console, "warn");

    // First visit
    await narration.call(talkAliceQuest, {});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    expect(narration.openedLabels).toEqual([]);

    // Second visit
    await narration.call(talkAliceQuest, {});
    expect(narration.dialogue?.text).toBe("What book do you want me to order?");
    await narration.continue({});
    expect(narration.dialogue?.text).toBe("For me it is the same.");
    await narration.continue({});
    expect(narration.openedLabels).toEqual([]);

    const stepShaWarnings = warnSpy.mock.calls.filter((args) =>
        String(args[0]).includes("stepSha not found"),
    );
    expect(stepShaWarnings).toHaveLength(0);
});
