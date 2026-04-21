import packageJson from "../../package.json";

const asciiRows = [
    "  ____  _      _ ___     ___   _ ",
    " |  _ \\(_)_  _(_| ) \\   / / \\ | |",
    " | |_) | \\ \\/ / |/ \\ \\ / /|  \\| |",
    " |  __/| |>  <| |   \\ V / | |\\  |",
    ` |_|   |_/_/\\_\\_|    \\_/  |_| \\_| v${packageJson.version}`,
];

const firstSegmentLength = 17;
const firstSegmentStyle = "background:#2f90da;";
const secondSegmentStyle = "background:#c832bb;";
const plainStyle = "background:transparent;";

export function asciiArtLog() {
    for (const row of asciiRows) {
        const versionSuffix = ` v${packageJson.version}`;
        const hasVersionSuffix = row.endsWith(versionSuffix);
        const contentRow = hasVersionSuffix
            ? row.slice(0, -versionSuffix.length)
            : row;
        const firstSegment = contentRow.slice(0, firstSegmentLength);
        const secondSegment = contentRow.slice(firstSegmentLength);
        const format = hasVersionSuffix ? "%c%s%c%s%c%s" : "%c%s%c%s";
        const values = hasVersionSuffix
            ? [
                  firstSegmentStyle,
                  firstSegment,
                  secondSegmentStyle,
                  secondSegment,
                  plainStyle,
                  versionSuffix,
              ]
            : [
                  firstSegmentStyle,
                  firstSegment,
                  secondSegmentStyle,
                  secondSegment,
              ];

        console.log(format, ...values);
    }
}
