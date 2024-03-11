import { Box, Grid } from '@mui/joy';
import DialogueMenuButton from '../components/DialogueMenuButton';
import { RunModeLabelEnum } from '../lib/enums/LabelEventEnum';
import { GameStepManager } from '../lib/managers/StepManager';
import { GameWindowManager } from '../lib/managers/WindowManager';
import { MunuOptionsType } from '../lib/types/MunuOptionsType';
import { clearMenuOptions } from '../lib/functions/DialogueUtility';

type IProps = {
    menu: MunuOptionsType,
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
    const height = GameWindowManager.enlargedHeight - dialogueWindowHeight

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
                            justifyContent="center"
                            alignItems="center"
                        >
                            <DialogueMenuButton
                                key={index}
                                onClick={() => {
                                    if (item.type == RunModeLabelEnum.OpenByCall) {
                                        clearMenuOptions()
                                        GameStepManager.runLabel(item.label)
                                        afterClick && afterClick()
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
