import { afterEach, describe, expect, test, vi } from "vitest";
import RegisteredTickers from "@tickers/decorators/RegisteredTickers";
import { tickers, TickersManagerStatic } from "@tickers/index";

describe("ticker duration fallback", () => {
    afterEach(() => {
        tickers.removeAll();
        vi.useRealTimers();
    });

    test.each([false, true])("clears the timeout and ignores removed tickers (removed=%s)", async (removed) => {
        vi.useFakeTimers();
        class TimedTicker {
            readonly id = "timed-ticker";
            args = {};
            readonly alias = "timed-ticker-regression";
            readonly duration = 0.1;
            canvasElementAliases: string[] = [];
            readonly paused = false;
            readonly complete = vi.fn();
            start() {}
            stop() {}
            pause() {}
            play() {}
        }
        RegisteredTickers.add(TimedTicker, "timed-ticker-regression");

        const ticker = new TimedTicker();
        tickers.add("alias", ticker);
        expect(TickersManagerStatic._currentTickersTimeouts.size).toBe(1);

        if (removed) tickers.remove(ticker.id);
        await vi.advanceTimersByTimeAsync(100);

        if (removed) expect(ticker.complete).not.toHaveBeenCalled();
        else expect(ticker.complete).toHaveBeenCalledWith({ ignoreTickerSteps: true });
        expect(TickersManagerStatic._currentTickersTimeouts.size).toBe(0);
    });
});
