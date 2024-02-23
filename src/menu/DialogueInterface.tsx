import { Button } from '@mui/joy';
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import { useState } from 'react';
import DragHandleDivider from '../components/DragHandleDivider';
import { GameWindowManager } from '../lib/manager';
import { resizeWindowsHandler } from '../utility/ComponentUtility';

export default function DialogueInterface() {
    const [windowSize, setWindowSize] = useState({
        x: 0,
        y: 300 * GameWindowManager.screenScale,
    });
    const [imageSize, setImageSize] = useState({
        x: 300 * GameWindowManager.screenScale,
        y: 0,
    })

    return (
        <Box
            sx={{
                width: '100%',
                position: "absolute",
                bottom: { xs: 14, sm: 18, md: 20, lg: 24, xl: 30 },
                left: 0,
                right: 0,
            }}
        >
            <DragHandleDivider
                orientation="horizontal"
                sx={{
                    position: "absolute",
                    top: -5,
                    width: "100%",
                }}
                onMouseDown={(e) => resizeWindowsHandler(e, windowSize, setWindowSize)}
            />
            <Card
                orientation="horizontal"
                sx={{
                    overflow: 'auto',
                    height: windowSize.y,
                    gap: 1
                }}
            >
                <AspectRatio
                    flex
                    ratio="1"
                    maxHeight={"20%"}
                    sx={{
                        height: "100%",
                        minWidth: imageSize.x,
                    }}
                >
                    <img
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286"
                        srcSet="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286&dpr=2 2x"
                        loading="lazy"
                        alt=""
                    />
                </AspectRatio>
                <DragHandleDivider
                    orientation="vertical"
                    onMouseDown={(e) => resizeWindowsHandler(e, imageSize, setImageSize)}
                    sx={{
                        width: 0,
                        left: -8,
                    }}
                />
                <CardContent>
                    <Typography fontSize="xl" fontWeight="lg"
                        sx={{
                            position: "absolute",
                            top: 7,
                        }}
                    >
                        Alex Morrison
                    </Typography>
                    <Sheet
                        sx={{
                            marginTop: 3,
                            bgcolor: 'background.level1',
                            borderRadius: 'sm',
                            p: 1.5,
                            minHeight: 10,
                            display: 'flex',
                            flex: 1,
                            overflow: 'auto',
                        }}
                    >
                        ..........
                    </Sheet>
                </CardContent>
            </Card>
            <Button
                variant="solid"
                color="primary"
                size="sm"
                sx={{
                    position: "absolute",
                    bottom: -10,
                    right: 0,
                    width: { xs: 70, sm: 100, md: 150 },
                    border: 3,
                    zIndex: 100,
                }}
            >
                Next
            </Button>
        </Box>
    );
}
