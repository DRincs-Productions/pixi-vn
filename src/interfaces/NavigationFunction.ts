import { StepLabelPropsType } from "../narration/types/StepLabelType";

export type NavigationFunctionType<OltherOptions> = (
    props: StepLabelPropsType,
    options: {
        /**
         * The navigate function.
         * @param path The path to navigate to.
         * @returns
         */
        navigate: (path: string) => void | Promise<void>;
    } & OltherOptions
) => Promise<void>;
