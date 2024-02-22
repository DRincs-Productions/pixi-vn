import { Link, LinkProps, LinkTypeMap, Typography } from "@mui/joy";
import { Link as RouterLink } from "react-router-dom";

interface IProps extends LinkProps<LinkTypeMap['defaultComponent'], {
    component?: React.ElementType;
    focusVisible?: boolean;
}> {
}

export default function TextMenuButton(props: IProps) {
    const {
        sx,
        children,
        ...rest
    } = props;

    return (
        <Link
            sx={{
                fontSize: { xs: "0.6rem", sm: "0.7rem", md: "0.8rem", lg: "1rem", xl: "1.1rem" },
                ...sx
            }}
            component={RouterLink}
            {...rest}
        >
            <Typography textColor="primary.200">
                {children}
            </Typography>
        </Link>
    );
}
