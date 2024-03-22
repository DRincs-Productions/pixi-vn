import { clearMenuOptions, GameStepManager, GameWindowManager, LabelRunModeEnum, MenuOptionsType } from '@drincs/pixi-vn';
import { Box, Grid } from '@mui/joy';
import { useState } from 'react';
import DialogueMenuButton from '../components/DialogueMenuButton';

type IProps = {
    menu: MenuOptionsType,
    dialogueWindowHeight: number,
    fullscreen?: boolean,
    afterClick?: () => void,
}

export default function DialogueMenuInterface(props: IProps) {
    const {
        menu,
        dialogueWindowHeight,
        fullscreen = true,
        afterClick,
    } = props;
    const [loading, setLoading] = useState(false)
    const height = GameWindowManager.screenHeight - dialogueWindowHeight

    return (
        <Box
            sx={{
                width: '100%',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: fullscreen ? "100%" : height,
            }}
        >
            <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
                spacing={2}
                sx={{
                    overflow: 'auto',
                    height: fullscreen ? "100%" : height,
                    gap: 1,
                    pointerEvents: "auto",
                    width: '100%',
                }}
            >
                {menu.map((item, index) => {
                    return (
                        <Grid
                            key={index}
                            justifyContent="center"
                            alignItems="center"
                        >
                            <DialogueMenuButton
                                loading={loading}
                                onClick={() => {
                                    if (item.type == LabelRunModeEnum.OpenByCall) {
                                        setLoading(true)
                                        clearMenuOptions()
                                        GameStepManager.callLabel(item.label)
                                            .then(() => {
                                                afterClick && afterClick()
                                                setLoading(false)
                                            })
                                            .catch((e) => {
                                                setLoading(false)
                                                console.error(e)
                                            })
                                    }
                                }}
                                sx={{
                                    left: 0,
                                    right: 0,
                                }}
                            >
                                {item.text}
                            </DialogueMenuButton>
                        </Grid>
                    )
                })}
            </Grid>
        </Box>
    );
}
