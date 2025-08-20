import { Container as PixiContainer } from "@drincs/pixi-vn/pixi.js";
import CanvasUtilitiesStatic from "../CanvasUtilitiesStatic";

export function calculatePositionByAlign(
    type: "width" | "height",
    align: number,
    value: number,
    pivot: number,
    negativeScale: boolean,
    anchor: number = 0
): number {
    pivot = pivot * (negativeScale ? -1 : 1);
    if (type === "width") {
        return (
            align * (CanvasUtilitiesStatic.screen.width - value) + pivot + anchor * value + (negativeScale ? value : 0)
        );
    } else {
        return (
            align * (CanvasUtilitiesStatic.screen.height - value) + pivot + anchor * value + (negativeScale ? value : 0)
        );
    }
}

export function calculateAlignByPosition(
    type: "width" | "height",
    position: number,
    value: number,
    pivot: number,
    negativeScale: boolean,
    anchor: number = 0
): number {
    pivot = pivot * (negativeScale ? -1 : 1);
    if (type === "width") {
        return (
            (position - pivot - anchor * value - (negativeScale ? value : 0)) /
            (CanvasUtilitiesStatic.screen.width - value)
        );
    } else {
        return (
            (position - pivot - anchor * value - (negativeScale ? value : 0)) /
            (CanvasUtilitiesStatic.screen.height - value)
        );
    }
}

export function calculatePositionByPercentagePosition(type: "width" | "height", percentage: number) {
    if (type === "width") {
        return percentage * CanvasUtilitiesStatic.screen.width;
    } else {
        return percentage * CanvasUtilitiesStatic.screen.height;
    }
}

export function calculatePercentagePositionByPosition(type: "width" | "height", position: number) {
    if (type === "width") {
        return position / CanvasUtilitiesStatic.screen.width;
    } else {
        return position / CanvasUtilitiesStatic.screen.height;
    }
}

export function getSuperPoint(point: { x: number; y: number }, angle: number): { x: number; y: number } {
    angle = angle % 360;
    if (angle < 0) {
        angle += 360;
    }
    if (angle === 0) {
        return { x: point.x, y: point.y };
    } else if (angle === 90) {
        return { x: -point.y, y: point.x };
    } else if (angle === 180) {
        return { x: -point.x, y: -point.y };
    } else if (angle === 270) {
        return { x: point.y, y: -point.x };
    } else if (angle > 0 && angle < 90) {
        let angleRad = (angle * Math.PI) / 180;
        let cos = Math.cos(angleRad);
        let sin = Math.sin(angleRad);
        let x = point.x * cos - point.y * sin;
        let y = point.x * sin + point.y * cos;
        // Ensure the sign of x matches point.x, and the sign of y matches point.y
        if (point.x !== 0 && Math.sign(x) !== Math.sign(point.x)) {
            x = -x;
        }
        if (point.y !== 0 && Math.sign(y) !== Math.sign(point.y)) {
            y = -y;
        }
        return { x, y };
    } else if (angle > 90 && angle < 180) {
        let angleRad = ((angle - 90) * Math.PI) / 180;
        let cos = Math.cos(angleRad);
        let sin = Math.sin(angleRad);
        let x = -point.y * sin - point.x * cos;
        let y = point.y * cos - point.x * sin;
        // Ensure the sign of x matches point.x, and the sign of y matches point.y
        if (point.x !== 0 && Math.sign(x) !== Math.sign(point.x)) {
            x = -x;
        }
        if (point.y !== 0 && Math.sign(y) !== Math.sign(point.y)) {
            y = -y;
        }
        return { x, y };
    } else if (angle > 180 && angle < 270) {
        let angleRad = ((angle - 180) * Math.PI) / 180;
        let cos = Math.cos(angleRad);
        let sin = Math.sin(angleRad);
        let x = -point.x * cos + point.y * sin;
        let y = -point.x * sin - point.y * cos;
        // Ensure the sign of x matches point.x, and the sign of y matches point.y
        if (point.x !== 0 && Math.sign(x) !== Math.sign(point.x)) {
            x = -x;
        }
        if (point.y !== 0 && Math.sign(y) !== Math.sign(point.y)) {
            y = -y;
        }
        return { x, y };
    } else if (angle > 270 && angle < 360) {
        let angleRad = ((angle - 270) * Math.PI) / 180;
        let cos = Math.cos(angleRad);
        let sin = Math.sin(angleRad);
        let x = point.y * sin - point.x * cos;
        let y = -point.y * cos - point.x * sin;
        // Ensure the sign of x matches point.x, and the sign of y matches point.y
        if (point.x !== 0 && Math.sign(x) !== Math.sign(point.x)) {
            x = -x;
        }
        if (point.y !== 0 && Math.sign(y) !== Math.sign(point.y)) {
            y = -y;
        }
        return { x, y };
    }
    return { x: 0, y: 0 };
}

export function getPointBySuperPoint(superPoint: { x: number; y: number }, angle: number): { x: number; y: number } {
    angle = angle % 360;
    if (angle < 0) {
        angle += 360;
    }
    if (angle === 0) {
        return { x: superPoint.x, y: superPoint.y };
    } else if (angle === 90) {
        return { x: superPoint.y, y: -superPoint.x };
    } else if (angle === 180) {
        return { x: -superPoint.x, y: -superPoint.y };
    } else if (angle === 270) {
        return { x: -superPoint.y, y: superPoint.x };
    } else if (angle > 0 && angle < 90) {
        let angleRad = (angle * Math.PI) / 180;
        let cos = Math.cos(angleRad);
        let sin = Math.sin(angleRad);
        return {
            x: superPoint.x * cos + superPoint.y * sin,
            y: -superPoint.x * sin + superPoint.y * cos,
        };
    } else if (angle > 90 && angle < 180) {
        let angleRad = ((angle - 90) * Math.PI) / 180;
        let cos = Math.cos(angleRad);
        let sin = Math.sin(angleRad);
        return {
            x: superPoint.y * cos - superPoint.x * sin,
            y: -superPoint.y * sin - superPoint.x * cos,
        };
    } else if (angle > 180 && angle < 270) {
        let angleRad = ((angle - 180) * Math.PI) / 180;
        let cos = Math.cos(angleRad);
        let sin = Math.sin(angleRad);
        return {
            x: -superPoint.x * cos - superPoint.y * sin,
            y: superPoint.x * sin - superPoint.y * cos,
        };
    } else if (angle > 270 && angle < 360) {
        let angleRad = ((angle - 270) * Math.PI) / 180;
        let cos = Math.cos(angleRad);
        let sin = Math.sin(angleRad);
        return {
            x: -superPoint.y * cos + superPoint.x * sin,
            y: superPoint.y * sin + superPoint.x * cos,
        };
    }
    return { x: 0, y: 0 };
}

export function getSuperWidth(canvasElement: PixiContainer): number {
    let width = canvasElement.width;
    let height = canvasElement.height;
    let angle = canvasElement.angle % 360;
    if (angle < 0) {
        angle += 360;
    }
    if (angle === 0 || angle === 180) {
        return width;
    } else if (angle === 90 || angle === 270) {
        return height;
    } else {
        return (
            Math.abs(width * Math.cos((angle * Math.PI) / 180)) + Math.abs(height * Math.sin((angle * Math.PI) / 180))
        );
    }
}

export function getSuperHeight(canvasElement: PixiContainer): number {
    let width = canvasElement.width;
    let height = canvasElement.height;
    let angle = canvasElement.angle % 360;
    if (angle < 0) {
        angle += 360;
    }
    if (angle === 0 || angle === 180) {
        return height;
    } else if (angle === 90 || angle === 270) {
        return width;
    } else {
        return (
            Math.abs(height * Math.cos((angle * Math.PI) / 180)) + Math.abs(width * Math.sin((angle * Math.PI) / 180))
        );
    }
}
