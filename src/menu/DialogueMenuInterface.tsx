import { Box, Grid } from '@mui/joy';
import DialogueMenuButton from '../components/DialogueMenuButton';
import { RunModeLabelEnum } from '../lib/enums/LabelEventEnum';
import { GameStepManager } from '../lib/managers/StepManager';
import { GameWindowManager } from '../lib/managers/WindowManager';
import { MunuOptionsType } from '../lib/types/MunuOptionsType';

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
            }}
        >
            <Grid
                container
                direction="row"
                justifyContent="center"
                alignItems="center"
                sx={{
                    overflow: 'auto',
                    height: fullscreen ? "100%" : height,
                    gap: 1,
                    pointerEvents: "auto",
                }}
            >
                {menu.map((item) => {
                    return (
                        <Grid xs={12} >
                            <DialogueMenuButton
                                onClick={() => {
                                    if (item.type == RunModeLabelEnum.OpenByCall) {
                                        GameStepManager.runLabel(item.label)
                                        afterClick && afterClick()
                                    }
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
