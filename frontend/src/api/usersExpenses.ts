import axios from 'axios';
import {EXPENSE_MANAGER_HTTP_ENDPOINT} from '../config/config';

export const getUsersExpenses: (billId: number, expenseId: number) => Promise<any[]> = (billId: number, expenseId: number) => axios.get(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills/${billId}/expenses/${expenseId}/usersexpenses`).then(res => res.data);
export const getUserExpense: (billId: number, expenseId: number, userId: number) => Promise<any> = (billId: number, expenseId: number, userId: number) => axios.get(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills/${billId}/expenses/${expenseId}/usersexpenses/${userId}`).then(res => res.data);
export const putUserExpense: (billId: number, expenseId: number, userId: number, userExpense: any) => Promise<any> = (billId: number, expenseId: number, userId: number, userExpense: any) => axios.put(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills/${billId}/expenses/${expenseId}/usersexpenses/${userId}`, userExpense).then(res => res.data);
