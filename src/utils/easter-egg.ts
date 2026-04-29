import packageJson from "../../package.json";

const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

const asciiRows = [
    "  ____  _      _ ___     ___   _ ",
    " |  _ \\(_)_  _(_| ) \\   / / \\ | |",
    " | |_) | \\ \\/ / |/ \\ \\ / /|  \\| |",
    " |  __/| |>  <| |   \\ V / | |\\  |",
    ` |_|   |_/_/\\_\\_|    \\_/  |_| \\_| v${packageJson.version}`,
];

const firstSegmentLength = " |_|   |_/_/\\_\\_|".length;
const firstSegmentStyle = "background:#2f90da;color:#fff;font-weight:bold;";
const secondSegmentStyle = "background:#c832bb;color:#fff;font-weight:bold;";
const plainStyle = "background:transparent;font-weight:bold;";
const versionSuffix = ` v${packageJson.version}`;

export function asciiArtLog() {
    if (!isBrowser) {
        return;
    }
    const formatParts: string[] = [];
    const values: string[] = [];

    for (let i = 0; i < asciiRows.length; i++) {
        const row = asciiRows[i];
        const hasVersionSuffix = row.endsWith(versionSuffix);
        const contentRow = hasVersionSuffix ? row.slice(0, -versionSuffix.length) : row;
        const firstSegment = contentRow.slice(0, firstSegmentLength);
        const secondSegment = contentRow.slice(firstSegmentLength);

        const rowFormat = hasVersionSuffix ? "%c%s%c%s%c%s" : "%c%s%c%s";
        formatParts.push(rowFormat);
        values.push(firstSegmentStyle, firstSegment, secondSegmentStyle, secondSegment);

        if (hasVersionSuffix) {
            values.push(plainStyle, versionSuffix);
        }
    }

    console.info(formatParts.join("\n"), ...values);
}
