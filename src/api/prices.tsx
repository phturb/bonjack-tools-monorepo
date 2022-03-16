import axios from "axios";

export interface Prices {
        id: number,
        timestamp: number,
        bLunaPrice: number,
        lunaPrice: number,
        ustGasPrice: number,
        lunaGasPrice: number
    }

export const getPrices = (): Promise<Prices[]> => axios.get<Prices[]>("http://tools.bonjack.club/api/prices").then((res) => res.data);