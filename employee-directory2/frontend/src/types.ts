export interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export type EmployeeInput = Pick<Employee, "name" | "email" | "role">;

export interface EmployeePage {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RoleCount {
  role: string;
  count: number;
}

export interface EmployeeMeta {
  total: number;
  recent: number;
  roles: RoleCount[];
}

export type SortKey = "name" | "role" | "created_at";
export type SortOrder = "asc" | "desc";

export interface ListParams {
  search: string;
  role: string;
  sort: SortKey;
  order: SortOrder;
  page: number;
  limit: number;
}

export interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}
