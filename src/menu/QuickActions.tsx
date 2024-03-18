import { Grid } from '@mui/joy';
import { useNavigate } from 'react-router-dom';
import TextMenuButton from '../components/TextMenuButton';
import { goBack, loadGameSave, saveGame } from '../utility/ActionsUtility';

type IProps = {
    afterLoad?: () => void
}

export default function QuickActions(props: IProps) {
    const { afterLoad: afterBack } = props
    const navigate = useNavigate();
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
                <TextMenuButton
                    onClick={() => goBack(navigate, afterBack)}
                >
                    Back
                </TextMenuButton>
            </Grid>
            <Grid
                paddingY={0}
            >
                <TextMenuButton
                    to="/history"
                >
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
                <TextMenuButton
                    onClick={saveGame}
                >
                    Save
                </TextMenuButton>
            </Grid>
            <Grid
                paddingY={0}
            >
                <TextMenuButton
                    onClick={() => loadGameSave(navigate, afterBack)}
                >
                    Load
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
