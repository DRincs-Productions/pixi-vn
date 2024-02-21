import { BrowserRouter } from 'react-router-dom';

type Iprops = {
    children: React.ReactNode
}

export default function AppImports(props: Iprops) {

    return (
        <BrowserRouter>
            {props.children}
        </BrowserRouter>
    );
}
