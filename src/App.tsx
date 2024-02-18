import { Box } from "@mui/material"
import { Manager } from "./lib/manager"

function App() {

    return (
        <Box
            sx={{
                position: 'absolute',
                backgroundColor: "red",
                width: `${Manager.getEnlargedWidth()}px`,
                height: `${Manager.getEnlargedHeight()}px`,
                marginLeft: `${Manager.getHorizontalMargin()}px`,
                marginRight: `${Manager.getHorizontalMargin()}px`,
                marginTop: `${Manager.getVerticalMargin()}px`,
                marginBottom: `${Manager.getVerticalMargin()}px`,
            }}
        >
        </Box>
    )
}

export default App
