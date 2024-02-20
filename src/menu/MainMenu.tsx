import { Button } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2

export default function MainMenu() {

    return (
        <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="flex-end"
            spacing={2}
            sx={{
                height: "100%",
                marginRight: { xs: 0, sm: 2, md: 4, lg: 6, xl: 8 }
            }}
        >
            <Grid>
                <Button
                    variant="contained"
                    size="small"
                    onResize={() => {
                        console.log("Button resized")
                    }}
                    onResizeCapture={() => {
                        console.log("Button resized capture")
                    }}
                >
                    Contained
                </Button>
            </Grid>
            <Grid>
                <Button
                    variant="contained"
                    size="small"
                >
                    Contained
                </Button>
            </Grid>
            <Grid>
                <Button
                    variant="contained"
                    size="small"
                >
                    Contained
                </Button>
            </Grid>
        </Grid>
    );
}
