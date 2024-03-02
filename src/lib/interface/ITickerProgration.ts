export type TickerProgrationType = ITickerProgrationLinear | ITickerProgrationExponential;
interface ITickerProgrationLinear {
    amt: number,
    limit?: number,
    type: "linear",
}
interface ITickerProgrationExponential {
    percentage: number,
    limit?: number,
    type: "exponential",
}