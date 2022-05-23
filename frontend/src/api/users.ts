import axios from 'axios';
import {EXPENSE_MANAGER_HTTP_ENDPOINT} from '../config/config';

export const getUsers: (billId: number) => Promise<any[]> = (billId: number) => axios.get(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills/${billId}/users`).then(res => res.data);
export const getUser: (billId: number, userId: number) => Promise<any> = (billId: number, userId: number) => axios.get(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills/${billId}/users/${userId}`).then(res => res.data);
export const postUser: (billId: number, user: any) => Promise<any> = (billId: number, user: any) => axios.post(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills/${billId}/users`, user).then(res => res.data);
export const putUser: (billId: number, userId: number, user: any) => Promise<any> = (billId: number, userId: number, user: any) => axios.put(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills/${billId}/users/${userId}`, user).then(res => res.data);
export const deleteUser: (billId: number, userId: number) => Promise<any> = (billId: number, userId: number) => axios.delete(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills/${billId}/users/${userId}`).then(res => res.data);
