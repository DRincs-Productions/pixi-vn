/**
 * Web Audio API polyfills for jsdom test environment.
 *
 * This file has NO static imports on purpose: ES module imports are hoisted
 * above the module body, so a file with imports cannot guarantee that its
 * body executes before Tone.js (loaded via the main src imports) evaluates
 * `hasAudioContext = window.hasOwnProperty("AudioContext")`.  By keeping this
 * file import-free we ensure the stubs are in place before any module that
 * depends on the Web Audio API is loaded.
 *
 * Listed as the FIRST entry in vitest.config.ts `setupFiles` so it runs
 * before tests/setup.ts.
 */

// ---------------------------------------------------------------------------
// AudioParam
// ---------------------------------------------------------------------------
if (typeof (globalThis as any).AudioParam === "undefined") {
    (globalThis as any).AudioParam = class AudioParam {
        value = 0;
        defaultValue = 0;
        minValue = -3.4028235e38;
        maxValue = 3.4028235e38;
        automationRate = "a-rate";
        setValueAtTime(v: number, _t: number) { this.value = v; return this as any; }
        linearRampToValueAtTime(v: number, _t: number) { this.value = v; return this as any; }
        exponentialRampToValueAtTime(v: number, _t: number) { this.value = v; return this as any; }
        setTargetAtTime(_t: number, _s: number, _tc: number) { return this as any; }
        setValueCurveAtTime(_vs: Float32Array, _s: number, _d: number) { return this as any; }
        cancelScheduledValues(_t: number) { return this as any; }
        cancelAndHoldAtTime(_t: number) { return this as any; }
        addEventListener() {}
        removeEventListener() {}
        dispatchEvent() { return false; }
    };
}

// ---------------------------------------------------------------------------
// AudioNode
// ---------------------------------------------------------------------------
if (typeof (globalThis as any).AudioNode === "undefined") {
    (globalThis as any).AudioNode = class AudioNode {
        channelCount = 2;
        channelCountMode = "max";
        channelInterpretation = "speakers";
        numberOfInputs = 1;
        numberOfOutputs = 1;
        connect(node: any) { return node; }
        disconnect() {}
        addEventListener() {}
        removeEventListener() {}
        dispatchEvent() { return false; }
    };
}

// ---------------------------------------------------------------------------
// AudioBuffer
// ---------------------------------------------------------------------------
if (typeof (globalThis as any).AudioBuffer === "undefined") {
    (globalThis as any).AudioBuffer = class AudioBuffer {
        length = 0;
        duration = 0;
        sampleRate = 44100;
        numberOfChannels = 1;
        getChannelData() { return new Float32Array(0); }
    };
}

// ---------------------------------------------------------------------------
// AudioContext  (with GainNode / StereoPannerNode / BufferSourceNode stubs)
// ---------------------------------------------------------------------------
if (typeof (globalThis as any).AudioContext === "undefined") {
    const _AudioParam: any = (globalThis as any).AudioParam;
    const _AudioNode: any = (globalThis as any).AudioNode;

    class _GainNode extends _AudioNode {
        gain = new _AudioParam();
    }

    class _StereoPannerNode extends _AudioNode {
        pan = new _AudioParam();
    }

    class _AudioDestinationNode extends _AudioNode {
        maxChannelCount = 2;
    }

    (globalThis as any).AudioContext = class AudioContext {
        sampleRate = 44100;
        currentTime = 0;
        state = "running";
        destination = new _AudioDestinationNode();
        onstatechange: (() => void) | null = null;
        listener = {
            forwardX: new _AudioParam(),
            forwardY: new _AudioParam(),
            forwardZ: new _AudioParam(),
            upX: new _AudioParam(),
            upY: new _AudioParam(),
            upZ: new _AudioParam(),
            positionX: new _AudioParam(),
            positionY: new _AudioParam(),
            positionZ: new _AudioParam(),
            setPosition(_xPos: number, _yPos: number, _zPos: number) {},
            setOrientation(_forwardX: number, _forwardY: number, _forwardZ: number, _upX: number, _upY: number, _upZ: number) {},
        };

        createGain() { return new _GainNode(); }
        createStereoPanner() { return new _StereoPannerNode(); }
        createBufferSource() {
            const node: any = new _AudioNode();
            node.buffer = null;
            node.loop = false;
            node.loopStart = 0;
            node.loopEnd = 0;
            node.playbackRate = new _AudioParam();
            node.detune = new _AudioParam();
            node.start = () => {};
            node.stop = () => {};
            return node;
        }
        createBuffer(channels: number, length: number, sampleRate: number) {
            return {
                numberOfChannels: channels,
                length,
                sampleRate,
                duration: length / sampleRate,
                getChannelData: () => new Float32Array(length),
            };
        }
        decodeAudioData(_buffer: ArrayBuffer) {
            return Promise.resolve({
                numberOfChannels: 1,
                length: 0,
                sampleRate: 44100,
                duration: 0,
                getChannelData: () => new Float32Array(0),
            });
        }
        resume() { return Promise.resolve(); }
        suspend() { return Promise.resolve(); }
        close() { return Promise.resolve(); }
        addEventListener() {}
        removeEventListener() {}
        dispatchEvent() { return false; }
    };
}
