// ==========================================
// RAMDOOT Foundation - Roles Decorator
// Used to specify which roles can access a route
// ==========================================

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
