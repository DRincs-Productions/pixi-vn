import DragHandleIcon from '@mui/icons-material/DragHandle';
import { Button, Divider, useTheme } from '@mui/joy';
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import { useState } from 'react';
import { Manager } from '../lib/manager';

type WindowsSize = {
    x: number,
    y: number,
}

export default function DialogueInterface() {
    const [size, setSize] = useState({
        x: 400 * Manager.screenScale,
        y: 300 * Manager.screenScale,
    });

    function handler<T>(mouseDownEvent: React.MouseEvent<T, MouseEvent>, size: WindowsSize, setSize: React.Dispatch<React.SetStateAction<WindowsSize>>) {
        const startSize = size;
        const startPosition = { x: mouseDownEvent.pageX, y: mouseDownEvent.pageY };

        function onMouseMove(mouseMoveEvent: any) {
            setSize(() => {
                let x = startSize.x - startPosition.x + mouseMoveEvent.pageX
                let y = startSize.y + startPosition.y - mouseMoveEvent.pageY
                return {
                    x: x > 1 ? x : 2,
                    y: y > 1 ? y : 2,
                }
            });
        }
        function onMouseUp() {
            document.body.removeEventListener("mousemove", onMouseMove);
        }

        document.body.addEventListener("mousemove", onMouseMove);
        document.body.addEventListener("mouseup", onMouseUp, { once: true });
    };

    return (
        <Box
            sx={{
                width: '100%',
                position: "absolute",
                overflow: { xs: 'auto', sm: 'initial' },
                bottom: { xs: 14, sm: 18, md: 20, lg: 24, xl: 30 },
                left: 0,
                right: 0,
            }}
        >
            <Divider
                orientation="horizontal"
                sx={{
                    position: "absolute",
                    top: -5,
                    width: "100%",
                }}
            >
                <DragHandleIcon
                    sx={{
                        cursor: "row-resize",
                        zIndex: 100,
                        backgroundColor: useTheme().palette.neutral[300],
                        ":hover": {
                            backgroundColor: useTheme().palette.neutral[200],
                        },
                        borderRadius: 2,
                        height: 13,
                        width: 40,
                    }}
                    onMouseDown={(e) => handler(e, size, setSize)}
                    color="primary"
                />
            </Divider>
            <Card
                orientation="horizontal"
                sx={{
                    overflow: 'auto',
                    height: size.y,
                }}
            >
                <AspectRatio
                    flex
                    ratio="1"
                    maxHeight={"20%"}
                    sx={{
                        height: "100%",
                        minWidth: "20%",
                    }}
                >
                    <img
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286"
                        srcSet="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286&dpr=2 2x"
                        loading="lazy"
                        alt=""
                    />
                </AspectRatio>
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
                    <Button
                        variant="solid"
                        color="primary"
                        size="sm"
                        sx={{
                            position: "absolute",
                            bottom: 0,
                            right: 0,
                        }}
                    >
                        Next
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
}
