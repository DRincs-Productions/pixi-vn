import { CharacterModelBase, GameStepManager, GameWindowManager, getCharacterByTag, getDialogue, getMenuOptions, MenuOptionsType } from '@drincs/pixi-vn';
import { Button } from '@mui/joy';
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import { useEffect, useState } from 'react';
import DragHandleDivider from '../components/DragHandleDivider';
import { resizeWindowsHandler } from '../utility/ComponentUtility';
import DialogueMenuInterface from './DialogueMenuInterface';
import QuickActions from './QuickActions';

type IProps = {
    upadateInterface: number
}

export default function DialogueInterface(props: IProps) {
    const { upadateInterface } = props
    const [windowSize, setWindowSize] = useState({
        x: 0,
        y: 300 * GameWindowManager.screenScale,
    });
    const [imageSize, setImageSize] = useState({
        x: 300 * GameWindowManager.screenScale,
        y: 0,
    })

    const [loading, setLoading] = useState(false)
    const [text, setText] = useState<string | undefined>(undefined)
    const [character, setCharacter] = useState<CharacterModelBase | undefined>(undefined)
    const [menu, setMenu] = useState<MenuOptionsType | undefined>(undefined)
    const [update, setUpdate] = useState(0)
    useEffect(() => {
        let dial = getDialogue()
        if (dial) {
            setText(dial.text)
            let c: CharacterModelBase | undefined = dial.characterTag ? getCharacterByTag(dial.characterTag) : undefined
            if (!c && dial.characterTag) {
                c = new CharacterModelBase(dial.characterTag, { name: dial.characterTag })
            }
            setCharacter(c)
        }
        else {
            setText(undefined)
            setCharacter(undefined)
        }
        let m = getMenuOptions()
        setMenu(m)
    }, [upadateInterface, update])

    function nextOnClick() {
        setLoading(true)
        GameStepManager.runNextStep()
            .then(() => {
                setUpdate((p) => p + 1)
                setLoading(false)
            })
            .catch((e) => {
                setLoading(false)

                console.error(e)
            })
    }

    return (
        <>
            <QuickActions afterLoad={() => setUpdate((p) => p + 1)} />
            {menu && <DialogueMenuInterface
                dialogueWindowHeight={windowSize.y + 50}
                fullscreen={text ? false : true}
                menu={menu}
                afterClick={() => setUpdate((p) => p + 1)}
            />}
            <Box
                sx={{
                    width: '100%',
                    position: "absolute",
                    bottom: { xs: 14, sm: 18, md: 20, lg: 24, xl: 30 },
                    left: 0,
                    right: 0,
                }}
            >
                {text && <DragHandleDivider
                    orientation="horizontal"
                    sx={{
                        position: "absolute",
                        top: -5,
                        width: "100%",
                        pointerEvents: "auto",
                    }}
                    onMouseDown={(e) => resizeWindowsHandler(e, windowSize, setWindowSize)}
                />}
                {text && <Card
                    orientation="horizontal"
                    sx={{
                        overflow: 'auto',
                        height: windowSize.y,
                        gap: 1,
                        pointerEvents: "auto",
                    }}
                >
                    {character?.icon && <AspectRatio
                        flex
                        ratio="1"
                        maxHeight={"20%"}
                        sx={{
                            height: "100%",
                            minWidth: imageSize.x,
                        }}
                    >
                        <img
                            src={character?.icon}
                            loading="lazy"
                            alt=""
                        />
                    </AspectRatio>}
                    {character?.icon && <DragHandleDivider
                        orientation="vertical"
                        onMouseDown={(e) => resizeWindowsHandler(e, imageSize, setImageSize)}
                        sx={{
                            width: 0,
                            left: -8,
                        }}
                    />}
                    <CardContent>
                        {character && <Typography fontSize="xl" fontWeight="lg"
                            sx={{
                                position: "absolute",
                                top: 7,
                                color: character.color,
                            }}

                        >
                            {character.name + (character.surname ? " " + character.surname : "")}
                        </Typography>
                        }
                        <Sheet
                            sx={{
                                marginTop: character ? 3 : undefined,
                                bgcolor: 'background.level1',
                                borderRadius: 'sm',
                                p: 1.5,
                                minHeight: 10,
                                display: 'flex',
                                flex: 1,
                                overflow: 'auto',
                            }}
                        >
                            {text}
                        </Sheet>
                    </CardContent>
                </Card>}
                {!menu && <Button
                    variant="solid"
                    color="primary"
                    size="sm"
                    loading={loading}
                    sx={{
                        position: "absolute",
                        bottom: -10,
                        right: 0,
                        width: { xs: 70, sm: 100, md: 150 },
                        border: 3,
                        zIndex: 100,
                        pointerEvents: "auto",
                    }}
                    onClick={nextOnClick}
                >
                    Next
                </Button>}
            </Box>
        </>
    );
}
