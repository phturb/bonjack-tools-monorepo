import axios from "axios";
import { API_HTTP_ENDPOINT } from "../config/config";

export interface Prices {
        id: number,
        timestamp: number,
        bLunaPrice: number,
        lunaPrice: number,
        ustGasPrice: number,
        lunaGasPrice: number
    }

type GetPrices = () => Promise<Prices[]>;

export const getPrices: GetPrices = () => axios.get<Prices[]>(`${API_HTTP_ENDPOINT}/prices`).then((res) => res.data);