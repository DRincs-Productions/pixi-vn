import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

type Iprops = {
    children: React.ReactNode
}

export default function AppImports(props: Iprops) {
    const queryClient = new QueryClient()

    return (
        <BrowserRouter>
            <QueryClientProvider client={queryClient} >
                {props.children}
            </QueryClientProvider>
        </BrowserRouter>
    );
}
