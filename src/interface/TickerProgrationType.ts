
export type TickerProgrationType = ITickerProgrationLinear | ITickerProgrationExponential;
export type ITickerProgrationLinear = {
    /**
     * The amount of the speed to increase every frame.
     */
    amt: number,
    /**
     * The limit of the effect
     */
    limit?: number,
    type: "linear",
}
export type ITickerProgrationExponential = {
    /**
     * The percentage of the speed to increase every frame. if the percentage is 0.1, the speed will increase by 10% every frame.
     */
    percentage: number,
    /**
     * The limit of the effect
     */
    limit?: number,
    type: "exponential",
}
