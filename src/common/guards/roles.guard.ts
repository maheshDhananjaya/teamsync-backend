import {
  Injectable,
  CanActivate,
  //   ExecutionHost,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GlobalRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context): boolean {
    // 1. Extract required roles from the method or its parent controller class
    const requiredRoles = this.reflector.getAllAndOverride<GlobalRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are explicitly required, allow free public or standard JWT access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 2. Extract the authenticated user from the HTTP request context
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException(
        'Access denied. No authentication profile discovered.',
      );
    }

    // 3. Verify if the user's role matches any of the required roles
    const hasRole = requiredRoles.includes(user.role as GlobalRole);
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Your role [${user.role}] does not have permission to access this resource.`,
      );
    }

    return true;
  }
}
