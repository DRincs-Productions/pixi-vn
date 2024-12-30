import { PropertiesExtension } from "@pixi/devtools";
import { ImageContainer, ImageSprite, VideoSprite } from "../classes";

const additionalPositionsProperties: PropertiesExtension = {
    extension: {
        type: "sceneProperties",
        name: 'additional-positions',
    },
    testNode(container) {
        return container instanceof ImageSprite || container instanceof VideoSprite || container instanceof ImageContainer
    },
    testProp(prop) {
        switch (prop) {
            case "align":
            case "xAlign":
            case "yAlign":
            case "percentagePosition":
            case "xPercentagePosition":
            case "yPercentagePosition":
            case "positionType":
                return true;
            default:
                return false;
        }
    },
    setProperty(container, prop, value) {
        if (container instanceof ImageSprite || container instanceof VideoSprite || container instanceof ImageContainer) {
            switch (prop) {
                case "align":
                    container.align = value;
                    break;
                case "xAlign":
                    container.xAlign = value;
                    break;
                case "yAlign":
                    container.yAlign = value;
                    break;
                case "percentagePosition":
                    container.percentagePosition = value;
                    break;
                case "xPercentagePosition":
                    container.xPercentagePosition = value;
                    break;
                case "yPercentagePosition":
                    container.yPercentagePosition = value;
                    break;
            }
        }
    },
    getProperties(container: ImageSprite | VideoSprite | ImageContainer) {
        return [
            {
                value: container.align,
                prop: 'align',
                entry: {
                    section: 'Position',
                    type: "vector2",
                    label: 'Align',
                },
            },
            {
                value: container.xAlign,
                prop: 'xAlign',
                entry: {
                    section: 'Position',
                    type: "number",
                    label: 'X Align',
                },
            },
            {
                value: container.yAlign,
                prop: 'yAlign',
                entry: {
                    section: 'Position',
                    type: "number",
                    label: 'Y Align',
                },
            },
            {
                value: container.percentagePosition,
                prop: 'percentagePosition',
                entry: {
                    section: 'Position',
                    type: "vector2",
                    label: 'Percentage Position',
                },
            },
            {
                value: container.xPercentagePosition,
                prop: 'xPercentagePosition',
                entry: {
                    section: 'Position',
                    type: "number",
                    label: 'X Percentage Position',
                },
            },
            {
                value: container.yPercentagePosition,
                prop: 'yPercentagePosition',
                entry: {
                    section: 'Position',
                    type: "number",
                    label: 'Y Percentage Position',
                },
            },
            {
                value: container.positionType,
                prop: 'positionType',
                entry: {
                    section: 'Position',
                    type: "select",
                    label: 'Position Type',
                    options: ["pixel", "percentage", "align"],
                },
            },
        ];
    },
};
export default additionalPositionsProperties;
