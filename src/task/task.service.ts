import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksQueryDto } from './dto/get-tasks-query.dto';
import { GlobalRole, ProjectRole } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  // 1. Create a task attached to a project board
  async createTask(projectId: string, createTaskDto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        ...createTaskDto,
        projectId,
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      },
    });
  }

  // 2. Fetch tasks with dynamic filtering, sorting, and pagination
  async getTasks(projectId: string, query: GetTasksQueryDto) {
    const { status, priority, assigneeId, page, limit, sortBy, sortOrder } =
      query;
    let skip: number = 0;
    if (page && limit) {
      skip = (page - 1) * limit;
    }

    const whereClause: any = { projectId };
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (assigneeId) whereClause.assigneeId = assigneeId;

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { [sortBy ?? '']: sortOrder },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.task.count({ where: whereClause }),
    ]);
    if (limit)
      return {
        data: tasks,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
  }

  // 3. Find a single task with its complete comment history thread
  async getTaskById(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, name: true } } },
        },
      },
    });

    if (!task) throw new NotFoundException('Requested task does not exist.');
    return task;
  }

  // 4. Update a task conditionally matching exact ownership constraints
  async updateTask(
    taskId: string,
    updateDto: Partial<CreateTaskDto>,
    userId: string,
    userRole: string,
  ) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Requested task does not exist.');

    // Extract user workspace role to confirm ownership authority
    const membership = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId } },
    });

    const isAdmin = userRole === GlobalRole.ADMIN;
    const isProjectManager = membership?.role === ProjectRole.MANAGER;
    const isAssignee = task.assigneeId === userId;

    if (!isAdmin && !isProjectManager && !isAssignee) {
      throw new ForbiddenException(
        'You do not have permission to modify this task resource.',
      );
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...updateDto,
        dueDate: updateDto.dueDate ? new Date(updateDto.dueDate) : undefined,
      },
    });
  }
}
