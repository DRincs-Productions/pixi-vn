import { Link, LinkProps } from '@mui/material';

interface IProps extends LinkProps {
}

export default function TextMenuButton(props: IProps) {
    const {
        sx,
        ...rest
    } = props;

    return (
        <Link
            underline="hover"
            sx={{
                fontSize: { xs: "0.6rem", sm: "0.7rem", md: "0.8rem", lg: "1rem", xl: "1.1rem" },
                ...sx
            }}
            {...rest}
        />
    );
}
