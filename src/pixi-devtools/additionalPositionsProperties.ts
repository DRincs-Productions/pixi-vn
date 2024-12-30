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
            case "xAlign":
            case "yAlign":
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
                case "xAlign":
                    container.xAlign = value / 100;
                    break;
                case "yAlign":
                    container.yAlign = value / 100;
                    break;
                case "xPercentagePosition":
                    container.xPercentagePosition = value / 100;
                    break;
                case "yPercentagePosition":
                    container.yPercentagePosition = value / 100;
                    break;
            }
        }
    },
    getProperties(container: ImageSprite | VideoSprite | ImageContainer) {
        return [
            {
                value: container.positionType,
                prop: 'positionType',
                entry: {
                    section: 'Custom Position',
                    type: "text",
                    label: 'Position Type',
                },
            },
            {
                value: container.xAlign * 100,
                prop: 'xAlign',
                entry: {
                    section: 'Custom Position',
                    type: "range",
                    label: 'X Align',
                    tooltip: '0% is left, 100% is right',
                    options: {
                        min: 0,
                        max: 100,
                    },
                },
            },
            {
                value: container.yAlign * 100,
                prop: 'yAlign',
                entry: {
                    section: 'Custom Position',
                    type: "range",
                    label: 'Y Align',
                    tooltip: '0% is top, 100% is bottom',
                    options: {
                        min: 0,
                        max: 100,
                    },
                },
            },
            {
                value: container.xPercentagePosition * 100,
                prop: 'xPercentagePosition',
                entry: {
                    section: 'Custom Position',
                    type: "range",
                    label: 'X Percentage Position',
                    tooltip: '0% is left, 100% is right',
                    options: {
                        min: 0,
                        max: 100,
                    },
                },
            },
            {
                value: container.yPercentagePosition * 100,
                prop: 'yPercentagePosition',
                entry: {
                    section: 'Custom Position',
                    type: "range",
                    label: 'Y Percentage Position',
                    tooltip: '0% is top, 100% is bottom',
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
