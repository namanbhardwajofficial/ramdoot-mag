// ==========================================
// RAMDOOT Foundation - Current User Decorator
// Extracts authenticated user from request
// ==========================================

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtPayload {
  sub: string;  // user ID
  email: string;
  role: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  fullName?: string;
}

/**
 * Decorator that extracts the authenticated user from the request.
 * Usage: @CurrentUser() user or @CurrentUser('id') userId
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;
    return data ? user?.[data] : user;
  },
);
