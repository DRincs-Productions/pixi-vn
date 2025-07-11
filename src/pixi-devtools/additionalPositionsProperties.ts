import { PropertiesExtension } from "@pixi/devtools";
import { ImageContainer, ImageSprite, VideoSprite } from "../canvas";

const additionalPositionsProperties: PropertiesExtension = {
    extension: {
        type: "sceneProperties",
        name: "additional-positions",
    },
    testNode(container) {
        return (
            container instanceof ImageSprite || container instanceof VideoSprite || container instanceof ImageContainer
        );
    },
    testProp(prop) {
        switch (prop) {
            case "xAlign":
            case "yAlign":
            case "percentageX":
            case "percentageY":
            case "positionType":
                return true;
            default:
                return false;
        }
    },
    setProperty(container, prop, value) {
        if (
            container instanceof ImageSprite ||
            container instanceof VideoSprite ||
            container instanceof ImageContainer
        ) {
            switch (prop) {
                case "xAlign":
                    container.xAlign = value / 100;
                    break;
                case "yAlign":
                    container.yAlign = value / 100;
                    break;
                case "percentageX":
                    container.percentageX = value / 100;
                    break;
                case "percentageY":
                    container.percentageY = value / 100;
                    break;
            }
        }
    },
    getProperties(container: ImageSprite | VideoSprite | ImageContainer) {
        return [
            {
                value: container.positionType,
                prop: "positionType",
                entry: {
                    section: "Transform",
                    type: "text",
                    label: "Position Type",
                },
            },
            {
                value: container.xAlign * 100,
                prop: "xAlign",
                entry: {
                    section: "Transform",
                    type: "range",
                    label: "X Align",
                    tooltip: "0% is left, 100% is right",
                    options: {
                        min: 0,
                        max: 100,
                    },
                },
            },
            {
                value: container.yAlign * 100,
                prop: "yAlign",
                entry: {
                    section: "Transform",
                    type: "range",
                    label: "Y Align",
                    tooltip: "0% is top, 100% is bottom",
                    options: {
                        min: 0,
                        max: 100,
                    },
                },
            },
            {
                value: container.percentageX * 100,
                prop: "percentageX",
                entry: {
                    section: "Transform",
                    type: "range",
                    label: "X Percentage Position",
                    tooltip: "0% is left, 100% is right",
                    options: {
                        min: 0,
                        max: 100,
                    },
                },
            },
            {
                value: container.percentageY * 100,
                prop: "percentageY",
                entry: {
                    section: "Transform",
                    type: "range",
                    label: "Y Percentage Position",
                    tooltip: "0% is top, 100% is bottom",
                    options: {
                        min: 0,
                        max: 100,
                    },
                },
            },
        ];
    },
};
export default additionalPositionsProperties;
