import AssetMemory from "../interfaces/AssetMemory";

export interface AsyncLoadExtensionProps {
    assetsData: AssetMemory[];
}

export default class AsyncLoadExtension {
    assetsAliases: string[] = [];
}
