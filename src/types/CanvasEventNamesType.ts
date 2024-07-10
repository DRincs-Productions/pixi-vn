/**
 * CanvasEventNamesType is a type that is used to define the event names for the canvas.
 */
type CanvasEventNamesType = (string | symbol) extends string | symbol
    ? (string | symbol)
    : keyof (string | symbol);

export default CanvasEventNamesType;