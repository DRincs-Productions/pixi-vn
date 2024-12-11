import { Container as PixiContainer, PointData } from "pixi.js";

export interface AnchorExtensionProps {
    anchor?: PointData | number
}

export default class AnchorExtension extends PixiContainer {
    /**
     * The anchor sets the origin point of the imageContainer. The default value is taken from the {@link Texture}
     * and passed to the constructor.
     *
     * The default is `(0,0)`, this means the imageContainer's origin is the top left.
     *
     * Setting the anchor to `(0.5,0.5)` means the imageContainer's origin is centered.
     *
     * Setting the anchor to `(1,1)` would mean the imageContainer's origin point will be the bottom right corner.
     *
     * If you pass only single parameter, it will set both x and y to the same value as shown in the example below.
     * @example
     * import { ImageContainer } from '@drincs/pixi-vn';
     *
     * const imageContainer = new ImageContainer();
     * imageContainer.anchor = 0.5;
     */
    get anchor(): PointData {
        throw new Error("Anchor is not implemented")
    }
    set anchor(_value: PointData | number) {
        throw new Error("Anchor is not implemented")
    }
}
