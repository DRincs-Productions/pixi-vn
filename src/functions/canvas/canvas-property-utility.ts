import { Container as PixiContainer } from "pixi.js";
import { canvas } from "../..";

export function calculatePositionByAlign(
    type: "width" | "height",
    align: number,
    width: number,
    pivot: number,
    anchor: number = 0
): number {
    if (type === "width") {
        return align * (canvas.screen.width - width) + pivot + anchor * width;
    } else {
        return align * (canvas.screen.height - width) + pivot + anchor * width;
    }
}

export function calculateAlignByPosition(
    type: "width" | "height",
    position: number,
    width: number,
    pivot: number,
    anchor: number = 0
): number {
    if (type === "width") {
        return (position - pivot - anchor * width) / (canvas.screen.width - width);
    } else {
        return (position - pivot - anchor * width) / (canvas.screen.height - width);
    }
}

export function calculatePositionByPercentagePosition(type: "width" | "height", percentage: number) {
    if (type === "width") {
        return percentage * canvas.screen.width;
    } else {
        return percentage * canvas.screen.height;
    }
}

export function calculatePercentagePositionByPosition(type: "width" | "height", position: number) {
    if (type === "width") {
        return position / canvas.screen.width;
    } else {
        return position / canvas.screen.height;
    }
}

export function getSuperPivot(canvasElement: PixiContainer): { x: number; y: number } {
    let angle = canvasElement.angle % 360;
    if (angle < 0) {
        angle += 360;
    }
    if (angle === 0) {
        return { x: canvasElement.pivot.x, y: canvasElement.pivot.y };
    } else if (angle === 90) {
        return { x: -canvasElement.pivot.y, y: canvasElement.pivot.x };
    } else if (angle === 180) {
        return { x: -canvasElement.pivot.x, y: -canvasElement.pivot.y };
    } else if (angle === 270) {
        return { x: canvasElement.pivot.y, y: -canvasElement.pivot.x };
    } else if (angle > 0 && angle < 90) {
        let angleRad = (angle * Math.PI) / 180;
        let cos = Math.cos(angleRad);
        let sin = Math.sin(angleRad);
        return {
            x: canvasElement.pivot.x * cos - canvasElement.pivot.y * sin,
            y: canvasElement.pivot.x * sin + canvasElement.pivot.y * cos,
        };
    } else if (angle > 90 && angle < 180) {
        let angleRad = ((angle - 90) * Math.PI) / 180;
        let cos = Math.cos(angleRad);
        let sin = Math.sin(angleRad);
        return {
            x: -canvasElement.pivot.y * sin - canvasElement.pivot.x * cos,
            y: canvasElement.pivot.y * cos - canvasElement.pivot.x * sin,
        };
    } else if (angle > 180 && angle < 270) {
        let angleRad = ((angle - 180) * Math.PI) / 180;
        let cos = Math.cos(angleRad);
        let sin = Math.sin(angleRad);
        return {
            x: -canvasElement.pivot.x * cos + canvasElement.pivot.y * sin,
            y: -canvasElement.pivot.x * sin - canvasElement.pivot.y * cos,
        };
    } else if (angle > 270 && angle < 360) {
        let angleRad = ((angle - 270) * Math.PI) / 180;
        let cos = Math.cos(angleRad);
        let sin = Math.sin(angleRad);
        return {
            x: canvasElement.pivot.y * sin - canvasElement.pivot.x * cos,
            y: -canvasElement.pivot.y * cos - canvasElement.pivot.x * sin,
        };
    }
    return { x: 0, y: 0 };
}

export function getPivotBySuperPivot(superPivot: { x: number; y: number }, angle: number): { x: number; y: number } {
    angle = angle % 360;
    if (angle < 0) {
        angle += 360;
    }
    if (angle === 0) {
        return { x: superPivot.x, y: superPivot.y };
    } else if (angle === 90) {
        return { x: superPivot.y, y: -superPivot.x };
    } else if (angle === 180) {
        return { x: -superPivot.x, y: -superPivot.y };
    } else if (angle === 270) {
        return { x: -superPivot.y, y: superPivot.x };
    } else if (angle > 0 && angle < 90) {
        let angleRad = (angle * Math.PI) / 180;
        let cos = Math.cos(angleRad);
        let sin = Math.sin(angleRad);
        return {
            x: superPivot.x * cos + superPivot.y * sin,
            y: -superPivot.x * sin + superPivot.y * cos,
        };
    } else if (angle > 90 && angle < 180) {
        let angleRad = ((angle - 90) * Math.PI) / 180;
        let cos = Math.cos(angleRad);
        let sin = Math.sin(angleRad);
        return {
            x: superPivot.y * cos - superPivot.x * sin,
            y: -superPivot.y * sin - superPivot.x * cos,
        };
    } else if (angle > 180 && angle < 270) {
        let angleRad = ((angle - 180) * Math.PI) / 180;
        let cos = Math.cos(angleRad);
        let sin = Math.sin(angleRad);
        return {
            x: -superPivot.x * cos - superPivot.y * sin,
            y: superPivot.x * sin - superPivot.y * cos,
        };
    } else if (angle > 270 && angle < 360) {
        let angleRad = ((angle - 270) * Math.PI) / 180;
        let cos = Math.cos(angleRad);
        let sin = Math.sin(angleRad);
        return {
            x: -superPivot.y * cos + superPivot.x * sin,
            y: superPivot.y * sin + superPivot.x * cos,
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
