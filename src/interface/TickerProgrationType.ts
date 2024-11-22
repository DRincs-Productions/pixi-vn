
type TickerProgrationType = TickerProgrationLinear | TickerProgrationExponential;
export default TickerProgrationType
export interface TickerProgrationLinear {
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
export interface TickerProgrationExponential {
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
