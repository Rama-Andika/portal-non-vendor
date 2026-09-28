import type { TPagination } from "./pagination.type";

export type TResponse<T> = {
  message: string;
  data?: T;
  pagination?: TPagination;
  errors?: T;
  requestId?: string;
};
