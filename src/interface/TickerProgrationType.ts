export type TickerProgrationType = ITickerProgrationLinear | ITickerProgrationExponential;
export type ITickerProgrationLinear = {
    amt: number,
    limit?: number,
    type: "linear",
}
export type ITickerProgrationExponential = {
    percentage: number,
    limit?: number,
    type: "exponential",
}