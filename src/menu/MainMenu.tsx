import { Grid } from '@mui/joy';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuButton from '../components/MenuButton';
import { StartLabel } from '../label/StartLabel';
import { clearAllGameDatas } from '../lib/functions/GameUtility';
import { addImage } from '../lib/functions/ImageUtility';
import { GameStepManager } from '../lib/managers/StepManager';
import { GameWindowManager } from '../lib/managers/WindowManager';

export default function MainMenu() {
    const navigate = useNavigate();
    useEffect(() => {
        clearAllGameDatas()
        let bg = addImage("background_main_menu", "https://andreannaking.com/wp-content/uploads/2021/12/Download-Beautiful-Nature-Landscape-Hd-Wallpaper-Full-HD-Wallpapers.jpg")
        bg.load()
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
                        GameWindowManager.removeCanvasElements()
                        GameStepManager.callLabel(StartLabel)
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
