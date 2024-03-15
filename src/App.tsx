import { Route, Routes } from 'react-router-dom';
import AppImports from './AppImports';
import DialogueInterface from './menu/DialogueInterface';
import HistoryInterface from './menu/HistoryInterface';
import MainMenu from './menu/MainMenu';

function App() {

    return (
        <AppImports>
            <Routes>
                <Route key={"main_menu"} path={"/"} element={<MainMenu />} />
            </Routes>
            <Routes>
                <Route key={"game"} path={"game"}
                    element={<DialogueInterface />}
                />
                <Route key={"history"} path={"history"}
                    element={<HistoryInterface />}
                />
            </Routes>
        </AppImports>
    )
}

export default App
