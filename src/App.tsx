import { Route, Routes } from 'react-router-dom';
import MainMenu from './menu/MainMenu';

function App() {

    return (
        <>
            <Routes>
                <Route key={"main_menu"} path={"/"} element={<MainMenu />} />
            </Routes>
        </>
    )
}

export default App
