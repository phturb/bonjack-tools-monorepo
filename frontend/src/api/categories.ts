import { EXPENSE_MANAGER_HTTP_ENDPOINT } from '../config/config';
import axios from 'axios';

export const getCategories: () => Promise<any[]> = () => axios.get<any[]>(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/categories`).then(res => res.data);
export const postCategory: (category: any) => Promise<any> = (category: any) => axios.post<any>(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/categories`, category).then(res => res.data);
export const deleteCategory: (categoryName: string) => Promise<any> = (categoryName: string) => axios.delete<any>(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/categories/${categoryName}`.then(res => res.data));
