---
name: pixi-vn-sound
description: Use when playing or stopping background music, sound effects, or voice lines; creating/organizing audio channels; controlling volume, mute, or pan; or wiring Tone.js audio filters (reverb, delay, EQ, etc.) in a Pixi'VN game.
---

# Pixi'VN sound: channels, playback, volume, and filters

Official docs: [pixi-vn.com/start/sound](https://pixi-vn.com/start/sound). The sound module is a wrapper around [Tone.js](https://tonejs.github.io/examples/); the whole audio system was revised in v1.6.0/1.8.0, so if you find older examples elsewhere, prefer this skill and the doc link above.

## When to use this skill

Use this skill whenever a task touches audio in a Pixi'VN project: starting/stopping music, playing a one-shot sound effect or a voice line, pausing/resuming playback, adjusting volume or mute state, or attaching Tone.js filters/effects. Requires `Game.init` to have already run (see `pixi-vn-getting-started`) and the `tone` peer dependency to be installed.

## Core mental model

`sound` (typed `SoundManagerInterface`) is the single entry point — do not import `SoundRegistry` directly, it's internal bookkeeping. Import it from the main package (as the official docs do):

```ts
import { sound } from "@drincs/pixi-vn";
```

(Also available from the narrower `@drincs/pixi-vn/sound` subpath — see `pixi-vn-getting-started` for when to prefer that.)

The docs describe four elements, from broadest to narrowest:

- **`sound` (manager)** — controls the entire audio system: manages channels, starts/controls media, and can set overall audio levels (`volumeAll`, `muteAll()`, etc.). Not saved in game saves — intended for game settings.
- **`channels`** (`AudioChannelInterface`) — named buses (e.g. `"music"`, `"sfx"`, `"voice"`) that contain, start, and manage media. Channel-level settings (`volume`, `pan`, `muted`, filters) affect only what's routed through that channel and are not saved. Every sound is played _through_ a channel — if you don't create one explicitly, everything plays through the implicit default channel, `sound.defaultChannelAlias` (`"general"`).
- **`media`** (`MediaInterface`) — a single started sound instance, returned by `play()`. Each has its own `paused`, `volume` (a raw Tone.js decibel `Param`, not linear), `loop`, `mute`, `playbackRate`, etc. These settings _are_ saved in the game save. Media instances are tracked by a **media alias** you choose (defaults to the sound's asset alias if you don't pass a separate one), so you can `sound.find()`/`pause()`/`resume()`/`stop()` them later by that alias.
- **`assets`** (sound assets) — the raw audio files, referenced by alias from the assets manifest (see `pixi-vn-assets` for registering and loading them, local or online). Asset-level settings affect every media created from that asset and are meant to be configured once at load time, not saved.

Key distinction: **channel volume and `sound.volumeAll` are linear** in `[0, 1]` (`channel.volume = 0.5`, `sound.volumeAll = 0.7`), while a **media instance's `volume`** is the underlying Tone.js `Param<"decibels">` inherited from `Tone.Player` (`media.volume.value = -6`, `media.volume.rampTo(-Infinity, 2)`). The `volume` you pass in `play()`'s _options_, however, is linear `[0, 1]` — it gets converted to decibels internally. (The official doc's inline examples set things like `channel.volume = 90` / `media.volume.value = 90` for illustration only — don't copy those numbers literally: on a real channel, `90` is wildly out of the linear `[0, 1]` range and will clip.)

`channel.background` marks a channel whose sounds should **not** be stopped automatically on scene/step transitions (useful for music that should keep playing across narration steps) — non-background channels are auto-stopped on every "continue".

## Playing music on a dedicated channel

```ts
import { sound } from "@drincs/pixi-vn";

// Create a background music channel once (e.g. right after Game.init resolves)
sound.addChannel("music", { background: true, volume: 0.8 });

// Start looping music through it
await sound.play("theme-song", { channel: "music", loop: true, volume: 0.8 });
```

`play()` accepts either:

```ts
sound.play(alias: string, options?: SoundPlayOptionsWithChannel): Promise<MediaInterface>;
sound.play(mediaAlias: string, soundAlias: string, options?: SoundPlayOptionsWithChannel): Promise<MediaInterface>;
```

Use the two-argument-alias form when you want to reference the instance under a different name than the underlying asset (e.g. multiple simultaneous instances of the same sound file). `options.channel` defaults to `sound.defaultChannelAlias` ("general"); if the named channel doesn't exist yet it is created automatically. The sound asset is auto-loaded (`sound.load()`) if it isn't already.

Calling `play()` again with the same media alias stops the previous instance and starts a new one, carrying over its previous options unless overridden — a handy way to restart or reconfigure something already playing.

Equivalently, you can call `play()` directly on a channel instead of passing `channel` in the options — `sound.findChannel("music").play("theme-song", { loop: true })` — the two forms are interchangeable; the docs show both.

### Fade in / fade out

`play()`'s `fadeIn`/`fadeOut` options (seconds) drive smooth transitions without any manual `rampTo` calls: `fadeIn` only affects the start, while `fadeOut` is remembered on the media and applied automatically both when playback ends naturally _and_ when you call `stop()` later.

```ts
const music = await sound.play("theme-song", {
  channel: "music",
  loop: true,
  fadeIn: 2, // 2s fade-in on start
  fadeOut: 3, // 3s fade-out, applied on both natural end and manual stop()
});

sound.stop("theme-song"); // fades out over the 3s configured above, instead of cutting off
```

## Playing a one-shot sound effect

For an SFX that should just fire and not be individually tracked/paused later, use `playTransient` — it returns a raw `Tone.Player`, is not added to `sound.find()`'s registry, and disposes itself automatically when it finishes:

```ts
await sound.playTransient("click-sound", { volume: 0.5 });
```

If you do need to reference the effect later (pause it, stop it by alias, check if it's still playing), use regular `play()` on an `"sfx"` channel instead:

```ts
sound.addChannel("sfx");
await sound.play("explosion", { channel: "sfx", volume: 1 });
```

## Playing a voice line

Voice is just another channel by convention — nothing special in the API distinguishes it from music/sfx, but keeping it on its own channel lets you separately mute/adjust volume for voice vs. music vs. effects (e.g. an in-game "voice volume" slider):

```ts
sound.addChannel("voice");
const line = await sound.play("narrator-intro", { channel: "voice" });
```

## Pause / resume

Both the channel and the manager expose bulk helpers; individual instances expose `paused`:

```ts
// By media alias, via the manager
sound.pause("narrator-intro");
sound.resume("narrator-intro");

// Or directly on the returned instance
line.paused = true;
line.paused = false;

// Everything on one channel
sound.findChannel("voice").pauseAll();
sound.findChannel("voice").resumeAll();

// Everything, globally
sound.pauseAll();
sound.resumeAll();
```

## Changing volume

```ts
// Channel volume — linear [0, 1], affects everything played through it
const music = sound.findChannel("music");
music.volume = 0.4;

// Smooth channel-wide fade using the raw Tone.js Param (decibels)
music.volumeParam.rampTo(-12, 3); // fade to -12dB over 3s
music.volumeParam.rampTo(-Infinity, 2); // fade to silence over 2s

// A single playing instance — volume is a Tone.js decibel Param, not linear
const instance = sound.find("narrator-intro");
if (instance) {
  instance.volume.value = -6; // set instantly, in decibels
  instance.volume.rampTo(0, 1); // fade back up to unity gain over 1s
}

// Global master volume — linear [0, 1]
sound.volumeAll = 0.7;
```

Muting works the same way at every level: `sound.muteAll()` / `sound.unmuteAll()` / `sound.toggleMuteAll()`, `channel.muted = true`, and `instance.mute = true` (the `MediaInterface.muted` alias still works but is deprecated in favor of `mute`).

## Stopping sounds

```ts
sound.stop("narrator-intro"); // stop one instance by media alias
sound.findChannel("music").stopAll(); // stop everything on a channel
sound.stopAll(); // stop every tracked instance, everywhere
sound.stopTransientAll(); // stop one-shot sounds started with playTransient
```

## Filters

Filters are plain Tone.js audio nodes — construct them directly from `tone` (`new Tone.Reverb(...)`, `new Tone.FeedbackDelay(...)`, `new Tone.Distortion(...)`, `new Tone.Chorus(...)`, etc.; `tone` must be installed as a peer dependency). They can be attached per-sound or per-channel, and are currently only settable when a media/channel is created (no live filter add/remove after the fact).

Per-sound, via `play()`'s `filters` option:

```ts
import * as Tone from "tone";
import { sound } from "@drincs/pixi-vn";

await sound.play("thunder", {
  channel: "sfx",
  filters: [new Tone.Reverb({ decay: 2.5, wet: 0.4 })],
});
```

Per-channel, so every sound routed through it is affected — either at creation time or later via `chain()`:

```ts
sound.addChannel("music", { filters: [new Tone.FeedbackDelay("8n", 0.5)] });

// or on an existing channel
sound.findChannel("music").chain(new Tone.Reverb({ decay: 2.5 }));
```

## Other/menu features

For settings screens or other menus, use the "unsaved" pause helpers instead of the regular ones — they don't perturb what gets restored from a save:

```ts
// On menu open: pause everything that isn't already paused
sound.pauseUnsavedAll();

// On menu close: resume only what pauseUnsavedAll paused (leaves already-paused media alone)
sound.resumeUnsavedAll();
```

For transient UI sounds (button clicks, hovers) that must never leak into a save file, prefer `sound.playTransient()` (see above) and `sound.stopTransientAll()` to stop all of them at once.

## Real-world project convention (official React template)

The library imposes no particular channel layout or settings architecture — everything above (channel names, how many channels, whether/how to persist volume) is up to the project. The following is how the official "TS narration + React" template (what `npm create pixi-vn@latest` scaffolds) does it in practice; treat it as **one proven convention to copy or adapt, not a requirement of the library itself**.

**Named constants instead of hardcoded strings.** Channel ids live in a constants file and are imported everywhere, so a rename is a one-line change:

```ts
// constants.ts
export const BGM_CHANNEL_NAME = "bgm";
export const SFX_CHANNEL_NAME = "sfx";
```

**Set up channels once, right after `Game.init` resolves**, mirroring the `background` distinction from earlier in this doc — the music channel keeps playing across narration steps, the SFX channel is left non-background so one-shots don't linger:

```ts
import { BGM_CHANNEL_NAME, SFX_CHANNEL_NAME } from "@/constants";
import { sound } from "@drincs/pixi-vn";

Game.init(body, options).then(() => {
  sound.addChannel(BGM_CHANNEL_NAME, { background: true }); // looping music
  sound.addChannel(SFX_CHANNEL_NAME); // one-shot effects
  sound.defaultChannelAlias = SFX_CHANNEL_NAME; // so play() calls needn't pass {channel: ...} every time
});
```

**Persist a settings-screen master volume/mute** to `localStorage`, syncing it to the manager on init and on every user change (UI works in a 0-100 scale; the library is linear 0-1):

```ts
export namespace MasterSound {
  export function init() {
    setVolume(storedVolume); // from localStorage, defaulting to sound.volumeAll * 100
    setMuted(storedMuted);
  }
  export function setVolume(volume: number) {
    sound.volumeAll = volume / 100;
    localStorage.setItem("master_volume", volume.toString());
  }
  export function setMuted(muted: boolean) {
    muted ? sound.muteAll() : sound.unmuteAll();
    localStorage.setItem("master_muted", muted.toString());
  }
}
```

**Do the same per channel** (e.g. separate music/SFX sliders), keyed by channel alias via a small cache of reactive state, using `sound.findChannel(alias).volume`/`.muted` in place of the `*All` manager calls:

```ts
export function setVolume(alias: string, volume: number) {
  sound.findChannel(alias).volume = volume / 100;
  localStorage.setItem(`${alias}_volume`, volume.toString());
}
export function setMuted(alias: string, muted: boolean) {
  sound.findChannel(alias).muted = muted;
  localStorage.setItem(`${alias}_muted`, muted.toString());
}
```

Both `init()`s run right after the channels are created (in the `Game.init(...).then(...)` block above), re-applying stored preferences to the manager/channels on every app load, not just persisting them for later.

## Related skills

- pixi-vn-getting-started
- pixi-vn-assets — registering and loading the audio files referenced here by alias
- pixi-vn-narration
- pixi-vn-storage
