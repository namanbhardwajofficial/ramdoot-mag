// ==========================================
// RAMDOOT Foundation - Public Decorator
// Marks a route as public (no JWT authentication required)
// ==========================================

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
