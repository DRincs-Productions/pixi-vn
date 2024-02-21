import { Button, ButtonProps } from '@mui/material';

interface IProps extends ButtonProps {
}

export default function MenuButton(props: IProps) {
    const {
        sx,
        ...rest
    } = props;

    return (
        <Button
            variant="contained"
            size="small"
            sx={{
                fontSize: { xs: "0.5rem", sm: "0.75rem", md: "1rem", lg: "1.25rem", xl: "1.5rem" },
                ...sx
            }}
            {...rest}
        />
    );
}
