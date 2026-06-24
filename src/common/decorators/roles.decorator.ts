import { SetMetadata } from '@nestjs/common';
import { GlobalRole } from '@prisma/client';

// The key used to save and retrieve role metadata within Nest's Reflector context
export const ROLES_KEY = 'roles';

// This decorator accepts a list of GlobalRoles and saves them against the endpoint
export const Roles = (...roles: GlobalRole[]) => SetMetadata(ROLES_KEY, roles);