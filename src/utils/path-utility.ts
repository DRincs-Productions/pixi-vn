export function getGamePath(): string {
    let path = window.location.pathname + window.location.hash
    if (path.includes('#')) {
        path = path.split('#')[1]
    }
    return path
}
