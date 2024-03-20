import { Button, ButtonProps, ButtonTypeMap } from "@mui/joy";

interface IProps extends ButtonProps<ButtonTypeMap['defaultComponent'], {
    component?: React.ElementType;
}> {
}

export default function DialogueMenuButton(props: IProps) {
    const {
        sx,
        ...rest
    } = props;

    return (
        <Button
            size="sm"
            {...rest}
        />
    );
}
