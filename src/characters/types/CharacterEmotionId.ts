import type { CharacterIdType } from "@characters/types/CharacterIdType";

/**
 * CharacterEmotionId is used to identify a character together with an emotion.
 */
export interface CharacterEmotionId {
    id: CharacterIdType;
    emotion: string;
}
