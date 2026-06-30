// ==========================================
// RAMDOOT Foundation - Response Interceptor
// Wraps all successful responses in standard format
// ==========================================

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If the controller already returned a formatted response, pass through
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }
        // Wrap in standard format
        return {
          success: true,
          message: 'Success',
          ...(data !== undefined && { data }),
        };
      }),
    );
  }
}
