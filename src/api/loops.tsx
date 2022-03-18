import axios from "axios";

// export interface Prices {
//         id: number,
//         timestamp: number,
//         bLunaPrice: number,
//         lunaPrice: number,
//         ustGasPrice: number,
//         lunaGasPrice: number
//     }

export const getLoops = (): Promise<any[]> => axios.get<any[]>(`${process.env.REACT_APP_HTTP_ENDPOINT || 'http://tools.bonjack.club/api'}/loops`).then((res) => res.data);