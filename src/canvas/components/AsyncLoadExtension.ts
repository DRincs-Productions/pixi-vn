import AssetMemory from "../interfaces/AssetMemory";

export const assetsData = "assetsData";
export interface AsyncLoadExtensionProps {
    assetsData: AssetMemory[];
}

export default class AsyncLoadExtension {
    readonly assetsAliases: string[] = [];
}
