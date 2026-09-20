// Registers pixi.js core filters and the pixi-filters collection for save/restore - side effect only,
// see register-builtin-filters.ts's own doc comment.
import "./classes/register-builtin-filters";

export { default as RegisteredFilters, filterDecorator } from "./decorators/RegisteredFilters";
export type { default as FilterMemory } from "./interfaces/FilterMemory";
