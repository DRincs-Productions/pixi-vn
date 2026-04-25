import type { ReverbOptions } from "tone";

type ReverbFilter = {
    type: "ReverbFilter";
} & Omit<ReverbOptions, "context">;

type SoundFilterMemory = ReverbFilter;
export default SoundFilterMemory;
