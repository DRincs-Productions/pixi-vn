type WindowsSize = {
    x: number,
    y: number,
}
export function resizeWindowsHandler<T>(mouseDownEvent: React.MouseEvent<T, MouseEvent>, size: WindowsSize, setSize: React.Dispatch<React.SetStateAction<WindowsSize>>) {
    const startSize = size;
    const startPosition = { x: mouseDownEvent.pageX, y: mouseDownEvent.pageY };

    function onMouseMove(mouseMoveEvent: any) {
        setSize(() => {
            let x = startSize.x - startPosition.x + mouseMoveEvent.pageX
            let y = startSize.y + startPosition.y - mouseMoveEvent.pageY
            return {
                x: x > 1 ? x : 2,
                y: y > 1 ? y : 2,
            }
        });
    }
    function onMouseUp() {
        document.body.removeEventListener("mousemove", onMouseMove);
    }

    document.body.addEventListener("mousemove", onMouseMove);
    document.body.addEventListener("mouseup", onMouseUp, { once: true });
}
