import { Route, Routes } from 'react-router-dom';
import AppImports from './AppImports';
import DialogueInterface from './menu/DialogueInterface';
import MainMenu from './menu/MainMenu';
import QuickActions from './menu/QuickActions';

function App() {

    return (
        <AppImports>
            <Routes>
                <Route key={"main_menu"} path={"/"} element={<MainMenu />} />
            </Routes>
            <Routes>
                <Route key={"game"} path={"game"}
                    element={<>
                        <QuickActions />
                        <DialogueInterface />
                    </>}
                />
            </Routes>
        </AppImports>
    )
}

export default App
