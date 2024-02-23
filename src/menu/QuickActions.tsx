import { Grid } from '@mui/joy';
import TextMenuButton from '../components/TextMenuButton';

export default function QuickActions() {
    return (
        <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="flex-end"
            spacing={2}
            sx={{
                height: "100%",
                width: "100%",
                paddingLeft: { xs: 1, sm: 2, md: 4, lg: 6, xl: 8 },
                position: "absolute",
                marginBottom: 0,
                bottom: 0,
            }}
        >
            <Grid
                paddingY={0}
            >
                <TextMenuButton>
                    Back
                </TextMenuButton>
            </Grid>
            <Grid
                paddingY={0}
            >
                <TextMenuButton>
                    History
                </TextMenuButton>
            </Grid>
            <Grid
                paddingY={0}
            >
                <TextMenuButton>
                    Skip
                </TextMenuButton>
            </Grid>
            <Grid
                paddingY={0}
            >
                <TextMenuButton>
                    Auto
                </TextMenuButton>
            </Grid>
            <Grid
                paddingY={0}
            >
                <TextMenuButton>
                    Save
                </TextMenuButton>
            </Grid>
            <Grid
                paddingY={0}
            >
                <TextMenuButton>
                    Q.Save
                </TextMenuButton>
            </Grid>
            <Grid
                paddingY={0}
            >
                <TextMenuButton>
                    Q.Load
                </TextMenuButton>
            </Grid>
            <Grid
                paddingY={0}
            >
                <TextMenuButton>
                    Prefs
                </TextMenuButton>
            </Grid>
        </Grid>
    );
}