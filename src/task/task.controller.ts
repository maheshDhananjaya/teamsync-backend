import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksQueryDto } from './dto/get-tasks-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Task Module')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller()
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post('projects/:projectId/tasks')
  @ApiOperation({
    summary: 'Create a new task under a specific project context',
  })
  create(
    @Param('projectId') projectId: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.taskService.createTask(projectId, createTaskDto);
  }

  @Get('projects/:projectId/tasks')
  @ApiOperation({
    summary: 'Get a paginated and filtered list of tasks for a project',
  })
  findProjectTasks(
    @Param('projectId') projectId: string,
    @Query() query: GetTasksQueryDto,
  ) {
    return this.taskService.getTasks(projectId, query);
  }

  @Get('tasks/:id')
  @ApiOperation({
    summary: 'Get a single task by ID along with its comment history',
  })
  findOne(@Param('id') id: string) {
    return this.taskService.getTaskById(id);
  }

  @Patch('tasks/:id')
  @ApiOperation({
    summary:
      'Update an existing task (Restricted to Assignee, Project Manager, or Admins)',
  })
  update(
    @Param('id') id: string,
    @Body() updateDto: CreateTaskDto,
    @Req() req,
  ) {
    const user = req.user as any;
    return this.taskService.updateTask(id, updateDto, user.id, user.role);
  }
}
