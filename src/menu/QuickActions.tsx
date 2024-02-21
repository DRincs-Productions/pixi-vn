import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
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
                bottom: 0
            }}
        >
            <Grid>
                <TextMenuButton>
                    Back
                </TextMenuButton>
            </Grid>
            <Grid>
                <TextMenuButton>
                    History
                </TextMenuButton>
            </Grid>
            <Grid>
                <TextMenuButton>
                    Skip
                </TextMenuButton>
            </Grid>
            <Grid>
                <TextMenuButton>
                    Auto
                </TextMenuButton>
            </Grid>
            <Grid>
                <TextMenuButton>
                    Save
                </TextMenuButton>
            </Grid>
            <Grid>
                <TextMenuButton>
                    Q.Save
                </TextMenuButton>
            </Grid>
            <Grid>
                <TextMenuButton>
                    Q.Load
                </TextMenuButton>
            </Grid>
            <Grid>
                <TextMenuButton>
                    Prefs
                </TextMenuButton>
            </Grid>
        </Grid>
    );
}
