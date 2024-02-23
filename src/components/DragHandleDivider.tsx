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
        orientation,
        ...rest
    } = props;

    return (
        <Divider
            orientation={orientation}
            {...rest}
        >
            <DragHandleIcon
                sx={{
                    cursor: orientation === "vertical" ? "col-resize" : "row-resize",
                    zIndex: 100,
                    backgroundColor: useTheme().palette.neutral[300],
                    ":hover": {
                        backgroundColor: useTheme().palette.neutral[200],
                    },
                    borderRadius: 2,
                    height: 13,
                    width: 40,
                    transform: orientation === "vertical" ? "rotate(90deg)" : undefined,
                }}
                onMouseDown={onMouseDown}
                color="primary"
            />
        </Divider>
    );
}
