import axios from "axios";
import { API_HTTP_ENDPOINT } from "../config/config";

export interface Tx {
  txHash: string;
  timestamp: number;
  loopId: number;
  priceId: number;
  rawLogs: string;
  gasUsed: number;
  amountIn: number;
  coinTypeIn: string;
  amountOut: number;
  cointTypeOut: string;
}

type GetTxs = () => Promise<Tx[]>;

export const getTxs: GetTxs = () =>
  axios.get<Tx[]>(`${API_HTTP_ENDPOINT}/txs`).then((res) => res.data);
