import axios from "axios";
import type { Employee, EmployeeInput, EmployeeMeta, EmployeePage, ListParams } from "./types";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000",
});

export const getEmployees = (params: ListParams) =>
  http.get<EmployeePage>("/employees", { params }).then((r) => r.data);

export const getMeta = () => http.get<EmployeeMeta>("/employees/meta").then((r) => r.data);

export const createEmployee = (input: EmployeeInput) =>
  http.post<Employee>("/employees", input).then((r) => r.data);

export const updateEmployee = (id: number, input: EmployeeInput) =>
  http.put<Employee>(`/employees/${id}`, input).then((r) => r.data);

export const deleteEmployee = (id: number) => http.delete(`/employees/${id}`);

/** Extracts a readable message from an Axios (or unknown) error. */
export function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message ?? "Cannot reach the server. Is the API running?";
  }
  return "Something went wrong.";
}
