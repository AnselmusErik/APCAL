export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflict") {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

export function handleApiError(error: unknown): {
  message: string;
  status: number;
} {
  if (error instanceof AppError) {
    return { message: error.message, status: error.statusCode };
  }

  if (error instanceof Error) {
    return { message: error.message, status: 500 };
  }

  return { message: "An unexpected error occurred", status: 500 };
}
