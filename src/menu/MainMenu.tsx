import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { useEffect } from 'react';
import MenuButton from '../components/MenuButton';
import { showImage } from '../lib/image';
import { Manager } from '../lib/manager';

export default function MainMenu() {
    useEffect(() => {
        Manager.removeChildren()
        showImage("background_main_menu", "https://andreannaking.com/wp-content/uploads/2021/12/Download-Beautiful-Nature-Landscape-Hd-Wallpaper-Full-HD-Wallpapers.jpg")
    })

    return (
        <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="flex-start"
            spacing={2}
            sx={{
                height: "100%",
                width: "100%",
                paddingLeft: { xs: 1, sm: 2, md: 4, lg: 6, xl: 8 }
            }}
        >
            <Grid>
                <MenuButton
                    onClick={() => {
                        Manager.removeChildren()
                    }}
                >
                    Continue
                </MenuButton>
            </Grid>
            <Grid>
                <MenuButton
                    onClick={() => {
                        Manager.removeChildren()
                    }}
                >
                    Start
                </MenuButton>
            </Grid>
            <Grid>
                <MenuButton>
                    Load
                </MenuButton>
            </Grid>
            <Grid>
                <MenuButton>
                    Preferences
                </MenuButton>
            </Grid>
            <Grid>
                <MenuButton>
                    About
                </MenuButton>
            </Grid>
        </Grid>
    );
}
