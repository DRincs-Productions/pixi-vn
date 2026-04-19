import packageJson from "../../package.json";

const ascii = `
  ____  _      _ ___     ___   _ 
 |  _ \\(_)_  _(_| ) \\   / / \\ | |
 | |_) | \\ \\/ / |/ \\ \\ / /|  \\| |
 |  __/| |>  <| |   \\ V / | |\\  |
 |_|   |_/_/\\_\\_|    \\_/  |_| \\_| v${packageJson.version}
`;

export function asciiArtLog() {
    console.log(ascii);
}
