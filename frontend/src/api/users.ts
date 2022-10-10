import axios from "axios";
import { EXPENSE_MANAGER_HTTP_ENDPOINT } from "../config/config";

type GetUsers = (billId: number) => Promise<any[]>;
type GetUser = (billId: number, userId: number) => Promise<any>;
type PostUser = (billId: number, user: any) => Promise<any>;
type PutUser = (billId: number, userId: number, user: any) => Promise<any>;
type DeleteUser = (billId: number, userId: number) => Promise<any>;

export const getUsers: GetUsers = (billId: number) =>
  axios
    .get(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills/${billId}/users`)
    .then((res) => res.data);
export const getUser: GetUser = (billId: number, userId: number) =>
  axios
    .get(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills/${billId}/users/${userId}`)
    .then((res) => res.data);
export const postUser: PostUser = (billId: number, user: any) =>
  axios
    .post(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills/${billId}/users`, user)
    .then((res) => res.data);
export const putUser: PutUser = (billId: number, userId: number, user: any) =>
  axios
    .put(
      `${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills/${billId}/users/${userId}`,
      user
    )
    .then((res) => res.data);
export const deleteUser: DeleteUser = (billId: number, userId: number) =>
  axios
    .delete(`${EXPENSE_MANAGER_HTTP_ENDPOINT}/bills/${billId}/users/${userId}`)
    .then((res) => res.data);
