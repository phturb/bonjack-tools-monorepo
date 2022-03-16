import axios from "axios";

export interface Tx {
    txHash: string,
    timestamp: number,
    loopId: number,
    priceId: number,
    rawLogs: string,
    gasUsed: number,
    amountIn: number,
    coinTypeIn: string,
    amountOut: number,
    cointTypeOut: string
}

export const getTxs = (): Promise<Tx[]> => axios.get<Tx[]>("http://tools.bonjack.club/api/txs").then((res) => res.data);