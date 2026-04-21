import packageJson from "../../package.json";

const asciiRows = [
    "  ____  _      _ ___     ___   _ ",
    " |  _ \\(_)_  _(_| ) \\   / / \\ | |",
    " | |_) | \\ \\/ / |/ \\ \\ / /|  \\| |",
    " |  __/| |>  <| |   \\ V / | |\\  |",
    ` |_|   |_/_/\\_\\_|    \\_/  |_| \\_| v${packageJson.version}`,
];

const firstSegmentLength = " |_|   |_/_/\\_\\_|".length;
const firstSegmentStyle = "background:#2f90da;";
const secondSegmentStyle = "background:#c832bb;";
const plainStyle = "background:transparent;";
const versionSuffix = ` v${packageJson.version}`;

export function asciiArtLog() {
    for (const row of asciiRows) {
        const hasVersionSuffix = row.endsWith(versionSuffix);
        const contentRow = hasVersionSuffix
            ? row.slice(0, -versionSuffix.length)
            : row;
        const firstSegment = contentRow.slice(0, firstSegmentLength);
        const secondSegment = contentRow.slice(firstSegmentLength);
        let format = "%c%s%c%s";
        const values: string[] = [
            firstSegmentStyle,
            firstSegment,
            secondSegmentStyle,
            secondSegment,
        ];

        if (hasVersionSuffix) {
            format += "%c%s";
            values.push(plainStyle, versionSuffix);
        }

        console.debug(format, ...values);
    }
}
