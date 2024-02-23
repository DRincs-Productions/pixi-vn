import DragHandleIcon from '@mui/icons-material/DragHandle';
import { Divider, DividerProps, DividerTypeMap, useTheme } from "@mui/joy";

interface IProps extends DividerProps<DividerTypeMap['defaultComponent'], {
    component?: React.ElementType;
}> {
    onMouseDown: React.MouseEventHandler<any>
}

export default function DragHandleDivider(props: IProps) {
    const {
        onMouseDown,
        ...rest
    } = props;

    return (
        <Divider
            {...rest}
        >
            <DragHandleIcon
                sx={{
                    cursor: "row-resize",
                    zIndex: 100,
                    backgroundColor: useTheme().palette.neutral[300],
                    ":hover": {
                        backgroundColor: useTheme().palette.neutral[200],
                    },
                    borderRadius: 2,
                    height: 13,
                    width: 40,
                }}
                onMouseDown={onMouseDown}
                color="primary"
            />
        </Divider>
    );
}
