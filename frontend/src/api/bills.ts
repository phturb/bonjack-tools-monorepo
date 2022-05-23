import { EXPENSE_MANAGER_HTTP_ENDPOINT } from "../config/config";
import axios from "axios";

export const getBills = (): Promise<any[]> => axios.get<any[]>(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills`).then((res) => res.data);
export const getBill = (billId: number): Promise<any> => axios.get<any>(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills/${billId}`).then((res) => res.data);
export const postBill = (bill: any): Promise<any> => axios.post<any>(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills`, bill).then((res) => res.data);
export const deleteBill = (billId: number): Promise<any> => axios.delete<any>(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills/${billId}`).then((res) => res.data);
