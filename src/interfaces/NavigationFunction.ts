import { StepLabelPropsType } from "../narration/types/StepLabelType";

export type NavigationFunctionType<OltherOptions, Result = void> = (
    props: StepLabelPropsType,
    options?: OltherOptions
) => Promise<Result>;
