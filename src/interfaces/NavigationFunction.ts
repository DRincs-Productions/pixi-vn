import { StepLabelPropsType, StepLabelResultType } from "../narration/types/StepLabelType";

export type NavigationFunctionType<OltherOptions> = (
    props: StepLabelPropsType,
    options?: OltherOptions
) => Promise<StepLabelResultType>;
