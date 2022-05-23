import axios from 'axios';
import { EXPENSE_MANAGER_HTTP_ENDPOINT } from '../config/config';

type GetExpenses = (billId: number) => Promise<any[]>;
type PostExpense = (billId: number, expense: any) => Promise<any>;
type GetExpense = (billId: number, expenseId: number) => Promise<any>;
type DeleteExpense = (billId: number, expenseId: number) => Promise<any>;

export const getExpenses: GetExpenses = (billId: number) => axios.get<any[]>(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills/${billId}/expenses`).then(res => res.data);
export const postExpense: PostExpense = (billId: number, expense: any) => axios.post(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills/${billId}/expenses`, expense).then(res => res.data);
export const getExpense: GetExpense = (billId: number, expenseId: number) => axios.get(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills/${billId}/expenses/${expenseId}`).then(res => res.data);
export const deleteExpense: DeleteExpense = (billId: number, expenseId: number) => axios.delete(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills/${billId}/expenses/${expenseId}`).then(res => res.data);
