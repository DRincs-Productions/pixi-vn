import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Wrap ResizeObserver callbacks in requestAnimationFrame so observations
// never cause synchronous layout changes — this prevents the browser from
// dispatching the "ResizeObserver loop" error that CRA's overlay shows.
const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
    constructor(callback: ResizeObserverCallback) {
        super((entries, observer) => {
            requestAnimationFrame(() => callback(entries, observer));
        });
    }
};

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </React.StrictMode>,
);
