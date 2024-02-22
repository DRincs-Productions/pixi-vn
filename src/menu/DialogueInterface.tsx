import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';

export default function DialogueInterface() {
    return (
        <Box
            sx={{
                width: '100%',
                position: "absolute",
                overflow: { xs: 'auto', sm: 'initial' },
                bottom: 30,
                left: 0,
                right: 0,
            }}
        >
            <Card
                orientation="horizontal"
            // sx={{
            //     overflow: 'auto',
            //     resize: "both",
            // }}
            >
                <AspectRatio
                    flex
                    ratio="1"
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
