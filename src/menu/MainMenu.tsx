import { Grid } from '@mui/joy';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuButton from '../components/MenuButton';
import { TickerTestLabel } from '../label/TickerTestLabel';
import { clearAllGameDatas } from '../lib/functions/GameUtility';
import { showImage } from '../lib/functions/ImageUtility';
import { GameStepManager } from '../lib/managers/StepManager';
import { GameWindowManager } from '../lib/managers/WindowManager';

export default function MainMenu() {
    const navigate = useNavigate();
    useEffect(() => {
        clearAllGameDatas()
        showImage("background_main_menu", "https://andreannaking.com/wp-content/uploads/2021/12/Download-Beautiful-Nature-Landscape-Hd-Wallpaper-Full-HD-Wallpapers.jpg")
    })

    return (
        <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="flex-start"
            spacing={{ xs: 1, sm: 2, lg: 3 }}
            sx={{
                height: "100%",
                width: "100%",
                paddingLeft: { xs: 1, sm: 2, md: 4, lg: 6, xl: 8 }
            }}
        >
            <Grid>
                <MenuButton
                    onClick={() => {
                        GameWindowManager.removeChildren()
                        GameStepManager.runLabel(TickerTestLabel)
                        navigate("/game")
                    }}
                >
                    Start
                </MenuButton>
            </Grid>
            <Grid>
                <MenuButton
                    disabled
                >
                    Load
                </MenuButton>
            </Grid>
            <Grid>
                <MenuButton
                    disabled
                >
                    Preferences
                </MenuButton>
            </Grid>
            <Grid>
                <MenuButton
                    disabled
                >
                    About
                </MenuButton>
            </Grid>
            <Grid>
                <MenuButton
                    disabled
                >
                    Help
                </MenuButton>
            </Grid>
        </Grid>
    );
}
