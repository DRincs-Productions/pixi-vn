export const debounce = <F extends (...args: any[]) => void>(fn: F, wait = 100) => {
    let t: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>) => {
        if (t) clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
    };
};

export function throttle(func: (...args: any[]) => Promise<void>, limit: number) {
    let lastCall = 0;
    return async (...args: any[]) => {
        const now = Date.now();
        if (now - lastCall >= limit) {
            lastCall = now;
            return await func(...args);
        }
    };
}
