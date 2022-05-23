import axios from 'axios';
import {EXPENSE_MANAGER_HTTP_ENDPOINT} from '../config/config';

type GetUsersExpenses = (billId: number, expenseId: number) => Promise<any[]>;
type GetUserExpense = (billId: number, expenseId: number, userId: number) => Promise<any>;
type PutUserExpense = (billId: number, expenseId: number, userId: number, userExpense: any) => Promise<any>;

export const getUsersExpenses: GetUsersExpenses = (billId: number, expenseId: number) => axios.get(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills/${billId}/expenses/${expenseId}/usersexpenses`).then(res => res.data);
export const getUserExpense: GetUserExpense = (billId: number, expenseId: number, userId: number) => axios.get(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills/${billId}/expenses/${expenseId}/usersexpenses/${userId}`).then(res => res.data);
export const putUserExpense: PutUserExpense = (billId: number, expenseId: number, userId: number, userExpense: any) => axios.put(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills/${billId}/expenses/${expenseId}/usersexpenses/${userId}`, userExpense).then(res => res.data);
