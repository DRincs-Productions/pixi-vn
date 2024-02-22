import DragHandleIcon from '@mui/icons-material/DragHandle';
import { Divider } from '@mui/joy';
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import { MouseEventHandler, useState } from 'react';

export default function DialogueInterface() {
    const [size, setSize] = useState({ x: 400, y: 300 });

    const handler: MouseEventHandler<any> = (mouseDownEvent) => {
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
            <Card
                orientation="horizontal"
                sx={{
                    overflow: 'auto',
                    height: size.y,
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
                            cursor: "row-resize"
                        }}
                        onMouseDown={handler}
                    />
                </Divider>
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
                    <Typography fontSize="xl" fontWeight="lg">
                        Alex Morrison
                    </Typography>
                    <Sheet
                        sx={{
                            bgcolor: 'background.level1',
                            borderRadius: 'sm',
                            p: 1.5,
                            my: 1.5,
                            display: 'flex',
                            gap: 2,
                            '& > div': { flex: 1 },
                            flex: 1,
                        }}
                    >
                        ..........
                    </Sheet>
                    <Box sx={{ display: 'flex', gap: 1.5, '& > button': { flex: 1 } }}>
                        <Button
                            variant="solid"
                            color="primary"
                            size="sm"
                        >
                            Next
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
