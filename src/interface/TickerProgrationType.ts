export type TickerProgrationType = ITickerProgrationLinear | ITickerProgrationExponential;
type ITickerProgrationLinear = {
    amt: number,
    limit?: number,
    type: "linear",
}
type ITickerProgrationExponential = {
    percentage: number,
    limit?: number,
    type: "exponential",
}