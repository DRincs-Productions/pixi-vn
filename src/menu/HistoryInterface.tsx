import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Box, CssVarsProvider, Input, Sheet, Stack, Typography } from "@mui/joy";
import Avatar from '@mui/joy/Avatar';
import { getDialogueHistory } from "../lib/functions/DialogueUtility";

export default function HistoryInterface() {
    return (
        <CssVarsProvider disableTransitionOnChange>
            <Sheet
                component="main"
                sx={{
                    // height: "calc(100vh - 55px)", // 55px is the height of the NavBar
                    height: "100%",
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "auto",
                    gridTemplateRows: "auto 1fr auto",
                    pointerEvents: "auto",
                }}
            >
                <Stack
                    sx={{
                        // backgroundColor: "background.surface",
                        px: { xs: 2, md: 4 },
                        py: 2,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <Stack sx={{ mb: 2 }}>
                        <Typography level="h2">Rental properties</Typography>
                    </Stack>
                    <Input
                        placeholder="Search"
                        value={"Melbourne"}
                        startDecorator={<SearchRoundedIcon />}
                        aria-label="Search"
                    />
                </Stack>
                <Stack spacing={2} sx={{ px: { xs: 2, md: 4 }, pt: 2, minHeight: 0 }}>
                    <Stack spacing={2} sx={{ overflow: "auto" }}>
                        {getDialogueHistory().map((dialogue) => (
                            <Stack direction="row" spacing={1.5}>
                                <Avatar size="sm" />
                                <Box sx={{ flex: 1 }}>
                                    <Typography level="title-sm">{dialogue?.characterTag}</Typography>
                                    <Typography level="body-sm">{dialogue?.text}</Typography>
                                </Box>
                            </Stack>
                        ))}
                    </Stack>
                </Stack>
            </Sheet>
        </CssVarsProvider>
    );
}
