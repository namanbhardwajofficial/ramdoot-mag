// ==========================================
// RAMDOOT Foundation - API Response Types
// ==========================================

/**
 * Standard API response wrapper used across all endpoints.
 * Provides consistent structure: { success, message, data, meta, error }
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  error?: ApiError;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiError {
  code: string;
  details?: any;
  stack?: string;
}

/**
 * Pagination query parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Creates a success response
 */
export function createSuccessResponse<T>(
  data?: T,
  message: string = 'Success',
  meta?: PaginationMeta,
): ApiResponse<T> {
  return {
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...(meta !== undefined && { meta }),
  };
}

/**
 * Creates an error response
 */
export function createErrorResponse(
  message: string = 'An error occurred',
  code: string = 'INTERNAL_ERROR',
  details?: any,
): ApiResponse {
  return {
    success: false,
    message,
    error: {
      code,
      ...(details !== undefined && { details }),
    },
  };
}
