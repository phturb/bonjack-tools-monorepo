import axios from "axios";
import { API_HTTP_ENDPOINT } from "../config/config";

// export interface Prices {
//         id: number,
//         timestamp: number,
//         bLunaPrice: number,
//         lunaPrice: number,
//         ustGasPrice: number,
//         lunaGasPrice: number
//     }

type GetLoops = () => Promise<any[]>;

export const getLoops: GetLoops = () => axios.get<any[]>(`${API_HTTP_ENDPOINT}/loops`).then((res) => res.data);