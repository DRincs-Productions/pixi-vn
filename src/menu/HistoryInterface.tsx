import CloseIcon from '@mui/icons-material/Close';
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Box, CssVarsProvider, IconButton, Input, Sheet, Stack, Typography } from "@mui/joy";
import Avatar from '@mui/joy/Avatar';
import { CharacterModelBase } from "../lib/classes/CharacterModelBase";
import { getCharacterByTag } from "../lib/decorators/CharacterDecorator";
import { getDialogueHistory } from "../lib/functions/DialogueUtility";

export default function HistoryInterface() {
    return (
        <CssVarsProvider disableTransitionOnChange>
            <Sheet
                component="main"
                sx={{
                    height: "100%",
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "auto",
                    gridTemplateRows: "auto 1fr auto",
                    pointerEvents: "auto",
                }}
            >
                <IconButton
                    sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        m: 2,
                    }}
                    onClick={() => {
                        window.history.back();
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Stack
                    sx={{
                        px: 2,
                        py: 2,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <Stack sx={{ mb: 2 }}>
                        <Typography level="h2">History</Typography>
                    </Stack>
                    <Input
                        placeholder="Search"
                        value={""}
                        startDecorator={<SearchRoundedIcon />}
                        aria-label="Search"
                    />
                </Stack>
                <Box
                    sx={{
                        display: 'flex',
                        flex: 1,
                        minHeight: 0,
                        px: 2,
                        py: 3,
                        overflowY: 'scroll',
                        flexDirection: 'column-reverse',
                    }}
                >
                    <Stack spacing={2} justifyContent="flex-end">
                        {getDialogueHistory().map((dialogue, index) => {
                            let character = dialogue.characterTag ? getCharacterByTag(dialogue.characterTag) ?? new CharacterModelBase(dialogue.characterTag, { name: dialogue.characterTag }) : undefined
                            return <Stack
                                direction="row"
                                spacing={1.5}
                                key={index}
                            >
                                <Avatar
                                    size="sm"
                                    src={character?.icon}
                                />
                                <Box sx={{ flex: 1 }}>
                                    {character?.name && <Typography level="title-sm">{character?.name + (character?.surname ? " " + character.surname : "")}</Typography>}
                                    <Typography level="body-sm">{dialogue.text}</Typography>
                                </Box>
                            </Stack>
                        })}
                    </Stack>
                </Box>
            </Sheet>
        </CssVarsProvider >
    );
}
