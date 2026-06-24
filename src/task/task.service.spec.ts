import {
  describe,
  beforeEach,
  afterEach,
  it,
  expect,
  jest,
} from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus, TaskPriority } from '@prisma/client';

describe('TaskService - Filtering & Pagination', () => {
  let service: TaskService;
  let prisma: PrismaService;

  // Mock implementation of Prisma client methods
  const mockPrismaService = {
    task: {
      findMany: jest.fn<() => Promise<any[]>>(),
      count: jest.fn<() => Promise<number>>(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should correctly calculate pagination skips and limits', async () => {
    const projectId = 'project-uuid';
    const queryDto = {
      page: 3,
      limit: 5,
      sortBy: 'createdAt',
      sortOrder: 'desc' as const,
    };

    mockPrismaService.task.findMany.mockResolvedValue([]);
    mockPrismaService.task.count.mockResolvedValue(12);

    const result = await service.getTasks(projectId, queryDto);

    // Verify pagination mathematical offset formulas: skip = (page - 1) * limit
    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10, // (3 - 1) * 5
        take: 5,
      }),
    );

    expect(result?.meta.totalPages).toBe(3); // 12 total tasks / 5 limit = 3 pages
  });

  it('should apply valid dynamic where filters when querying tasks', async () => {
    const projectId = 'project-uuid';
    const queryDto = {
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      page: 1,
      limit: 10,
    };

    mockPrismaService.task.findMany.mockResolvedValue([]);
    mockPrismaService.task.count.mockResolvedValue(0);

    await service.getTasks(projectId, queryDto);

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          projectId,
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.HIGH,
        },
      }),
    );
  });
});
