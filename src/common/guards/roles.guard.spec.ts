import {
  describe,
  beforeEach,
  afterEach,
  it,
  expect,
  jest,
} from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { GlobalRole } from '@prisma/client';

describe('RolesGuard Behavior Framework', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  // Helper utility to generate dummy NestJS Execution Context structures
  const createMockContext = (userPayload: any): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: userPayload,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: mockReflector }],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should return true if no metadata roles are set on the target endpoint', () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined); // No roles required
    const context = createMockContext({ role: GlobalRole.MEMBER });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow entry if the authenticated users role matches the metadata specs', () => {
    mockReflector.getAllAndOverride.mockReturnValue([
      GlobalRole.ADMIN,
      GlobalRole.MANAGER,
    ]);
    const context = createMockContext({ role: GlobalRole.MANAGER });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw a ForbiddenException if the users profile role is unauthorized', () => {
    mockReflector.getAllAndOverride.mockReturnValue([GlobalRole.ADMIN]);
    const context = createMockContext({ role: GlobalRole.MEMBER });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
