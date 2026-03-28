import type { StepLabelProps } from "@drincs/pixi-vn";

/**
 * Type for on-error handlers. Handlers accept the error type, the error
 * object and the step props; they may be synchronous or asynchronous.
 */
type OnErrorHandler = (error: unknown, props: StepLabelProps | {}) => void | Promise<void>;

export default OnErrorHandler;
