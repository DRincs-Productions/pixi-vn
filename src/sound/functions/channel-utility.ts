/**
 * This function calculates the final volume of a sound by multiplying the media volume and the channel volume.
 * If one of the volumes is undefined, it returns the other volume. If both are undefined, it returns undefined.
 * @param mediaVolume The volume of the media instance, which can be undefined.
 * @param channelVolume The volume of the audio channel, which can be undefined.
 * @returns The final volume of the sound, or undefined if both mediaVolume and channelVolume are undefined.
 */
export function calculateVolume(mediaVolume: number | undefined, channelVolume: number | undefined): number {
    if (mediaVolume === undefined && channelVolume === undefined) {
        return 1;
    } else if (channelVolume === undefined && mediaVolume !== undefined) {
        return mediaVolume;
    } else if (mediaVolume === undefined && channelVolume !== undefined) {
        return channelVolume;
    } else if (mediaVolume === undefined || channelVolume === undefined) {
        return 1;
    }
    // if mediaVolume is 0.5 and channelVolume is 0.5, the result should be 0.25
    // if mediaVolume is 0.7 and channelVolume is 0.5, the result should be 0.35
    // if mediaVolume is 0.5 and channelVolume is 0.7, the result should be 0.35
    return mediaVolume * channelVolume;
}
