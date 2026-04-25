import { GameUnifier, PixiError } from "@drincs/pixi-vn/core";
import MediaInstance from "@sound/classes/MediaInstance";
import { decibelsToLinear, linearToDecibels, soundLoad } from "@sound/functions/sound-utility";
import type AudioChannelInterface from "@sound/interfaces/AudioChannelInterface";
import type MediaInteface from "@sound/interfaces/MediaInteface";
import type { ChannelOptions, SoundPlayOptions } from "@sound/interfaces/SoundOptions";
import SoundRegistry from "@sound/SoundRegistry";
import * as Tone from "tone";

export default class AudioChannel implements AudioChannelInterface {
    /**
     * The underlying Tone.Channel that handles volume, pan and mute for this
     * channel in the Web Audio graph.  All players are connected into this node
     * before it is routed to the audio destination.
     */
    readonly toneChannel: Tone.Channel;

    constructor(
        readonly alias: string,
        channelOptions: ChannelOptions = {},
    ) {
        this.alias = alias;
        this.background = channelOptions.background ?? false;

        // Create and connect Tone.Channel with the requested initial values.
        this.toneChannel = new Tone.Channel({
            volume: linearToDecibels(channelOptions.volume ?? 1),
            mute: channelOptions.muted ?? false,
            pan: channelOptions.pan ?? 0,
        })
            .toDestination()
            .connect(SoundRegistry.liveBus);

        if (channelOptions.filters) {
            this.toneChannel.chain(...channelOptions.filters);
        }
    }

    // ------------------------------------------------------------------ //
    // volume — linear [0, 1] façade over Tone.Channel's dB Param          //
    // ------------------------------------------------------------------ //

    get volume(): number {
        return decibelsToLinear(this.toneChannel.volume.value);
    }
    set volume(v: number) {
        this.toneChannel.volume.value = linearToDecibels(v);
    }
    get volumeParam(): Tone.Param<"decibels"> {
        return this.toneChannel.volume;
    }

    // ------------------------------------------------------------------ //
    // pan — plain number [-1, 1] façade over Tone.Channel's audioRange Param //
    // ------------------------------------------------------------------ //

    get pan(): number {
        return this.toneChannel.pan.value;
    }
    set pan(v: number) {
        this.toneChannel.pan.value = v;
    }
    get panParam(): Tone.Param<"audioRange"> {
        return this.toneChannel.pan;
    }

    // ------------------------------------------------------------------ //
    // muted — read/write, delegating to Tone.Channel's mute property      //
    // ------------------------------------------------------------------ //

    get muted(): boolean {
        return this.toneChannel.mute;
    }
    set muted(v: boolean) {
        this.toneChannel.mute = v;
    }

    // ------------------------------------------------------------------ //
    // paused — no Tone.Channel equivalent; managed internally             //
    // ------------------------------------------------------------------ //

    pauseAll(): this {
        for (const mediaInstance of SoundRegistry.mediaInstances.values() as MapIterator<MediaInstance>) {
            if (mediaInstance.channelAlias === this.alias && !mediaInstance.paused) {
                mediaInstance.paused = true;
            }
        }
        return this;
    }

    resumeAll(): this {
        for (const mediaInstance of SoundRegistry.mediaInstances.values() as MapIterator<MediaInstance>) {
            if (mediaInstance.channelAlias === this.alias && mediaInstance.paused) {
                mediaInstance.paused = false;
            }
        }
        return this;
    }

    // ------------------------------------------------------------------ //
    // chain — route channel output through effect nodes                   //
    // ------------------------------------------------------------------ //

    chain(...nodes: Tone.InputNode[]): this {
        this.toneChannel.disconnect();
        this.toneChannel.chain(...nodes, Tone.getDestination());
        return this;
    }

    // ------------------------------------------------------------------ //
    // background                                                          //
    // ------------------------------------------------------------------ //

    readonly background: boolean;

    // ------------------------------------------------------------------ //
    // Private helpers                                                     //
    // ------------------------------------------------------------------ //

    private _createPlayer(
        alias: string,
        soundAlias: string,
        options: SoundPlayOptions = {},
    ): MediaInstance {
        const buffer = SoundRegistry.bufferRegistry.get(soundAlias);
        if (!buffer) {
            throw new PixiError(
                "unregistered_asset",
                `Sound buffer for alias "${soundAlias}" is not loaded. Call sound.load() first.`,
            );
        }

        const {
            delay,
            filters = [],
            paused,
            muted,
            autostart = paused ? !paused : true,
            mute = muted,
            speed,
            playbackRate = speed,
            ...restOptions
        } = options;
        const player = new MediaInstance(alias, this.alias, soundAlias, GameUnifier.stepCounter, {
            ...restOptions,
            url: buffer,
            autostart,
            mute,
            playbackRate,
        });
        if (delay) {
            const delayFilter = new Tone.Delay(delay);
            player.chain(delayFilter, ...filters, this.toneChannel);
        } else {
            player.chain(...filters, this.toneChannel);
        }

        return player;
    }

    async play(alias: string, options?: SoundPlayOptions): Promise<MediaInteface>;
    async play(
        mediaAlias: string,
        soundAlias: string,
        options?: SoundPlayOptions,
    ): Promise<MediaInteface>;
    async play(
        aliasOrMediaAlias: string,
        soundAliasOrOptions?: string | SoundPlayOptions,
        options?: SoundPlayOptions,
    ): Promise<MediaInteface> {
        let mediaAlias: string;
        let soundAlias: string;
        if (typeof soundAliasOrOptions === "string") {
            mediaAlias = aliasOrMediaAlias;
            soundAlias = soundAliasOrOptions;
        } else {
            mediaAlias = aliasOrMediaAlias;
            soundAlias = aliasOrMediaAlias;
            options = soundAliasOrOptions;
        }

        if (SoundRegistry.mediaInstances.has(mediaAlias)) {
            const oldMedia = SoundRegistry.mediaInstances.get(mediaAlias) as MediaInstance;
            if (oldMedia) {
                oldMedia.stop();
                options = {
                    ...oldMedia.options,
                    ...options,
                };
            }
        }

        await soundLoad(soundAlias);
        const media = this._createPlayer(soundAlias, soundAlias, options);

        SoundRegistry.mediaInstances.set(mediaAlias, media);
        return media;
    }

    toggleMuteAll(): boolean {
        this.muted = !this.muted;
        return this.muted;
    }

    get mediaInstances(): MediaInteface[] {
        return Array.from(SoundRegistry.mediaInstances.values()).reduce(
            (instances: MediaInteface[], mediaInstance) => {
                if ((mediaInstance as MediaInstance).channelAlias === this.alias) {
                    instances.push(mediaInstance);
                }
                return instances;
            },
            [],
        );
    }

    stopAll() {
        const aliasesToDelete: string[] = [];
        for (const [
            mediaAlias,
            mediaInstance,
        ] of SoundRegistry.mediaInstances.entries() as MapIterator<[string, MediaInstance]>) {
            if (mediaInstance.channelAlias === this.alias) {
                mediaInstance.stop();
                aliasesToDelete.push(mediaAlias);
            }
        }
        aliasesToDelete.forEach((mediaAlias) => {
            SoundRegistry.mediaInstances.delete(mediaAlias);
        });
        return this;
    }
}
