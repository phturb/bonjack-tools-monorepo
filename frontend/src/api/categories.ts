import { EXPENSE_MANAGER_HTTP_ENDPOINT } from "../config/config";
import axios from "axios";

type GetCategories = () => Promise<any[]>;
type PostCategory = (category: any) => Promise<any>;
type DeleteCategory = (categoryName: string) => Promise<any>;

export const getCategories: GetCategories = () =>
  axios
    .get<any[]>(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/categories`)
    .then((res) => res.data);
export const postCategory: PostCategory = (category: any) =>
  axios
    .post<any>(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/categories`, category)
    .then((res) => res.data);
export const deleteCategory: DeleteCategory = (categoryName: string) =>
  axios
    .delete<any>(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/categories/${categoryName}`)
    .then((res) => res.data);
