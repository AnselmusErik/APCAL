export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface UserWithRoles {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  roles: Array<{
    role: {
      id: string;
      name: string;
    };
  }>;
}
