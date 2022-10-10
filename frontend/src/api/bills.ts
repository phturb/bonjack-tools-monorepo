import { EXPENSE_MANAGER_HTTP_ENDPOINT } from "../config/config";
import axios from "axios";

type GetBills = () => Promise<any[]>;
type GetBill = (billId: number) => Promise<any>;
type PostBill = (bill: any) => Promise<any>;
type DeleteBill = (billId: number) => Promise<any>;

export const getBills: GetBills = (): Promise<any[]> =>
  axios
    .get<any[]>(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills`)
    .then((res) => res.data);
export const getBill: GetBill = (billId: number): Promise<any> =>
  axios
    .get<any>(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills/${billId}`)
    .then((res) => res.data);
export const postBill: PostBill = (bill: any): Promise<any> =>
  axios
    .post<any>(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills`, bill)
    .then((res) => res.data);
export const deleteBill: DeleteBill = (billId: number): Promise<any> =>
  axios
    .delete<any>(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills/${billId}`)
    .then((res) => res.data);
