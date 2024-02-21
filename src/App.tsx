import { Route, Routes } from 'react-router-dom';
import AppImports from './AppImports';
import MainMenu from './menu/MainMenu';

function App() {

    return (
        <AppImports>
            <Routes>
                <Route key={"main_menu"} path={"/"} element={<MainMenu />} />
            </Routes>
        </AppImports>
    )
}

export default App
