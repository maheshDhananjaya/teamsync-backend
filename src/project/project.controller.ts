import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GlobalRole } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Project Module')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Post()
  @Roles(GlobalRole.ADMIN, GlobalRole.MANAGER) // Restrict creation per spec
  @ApiOperation({
    summary: 'Create a brand new project workspace (Managers/Admins only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Project established successfully.',
  })
  create(@Body() createProjectDto: CreateProjectDto, @Req() req) {
    const user = req.user as any;
    return this.projectService.createProject(createProjectDto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all projects the authenticated user belongs to',
  })
  @ApiResponse({ status: 200, description: 'List of matching project boards.' })
  async findAll(@Req() req) {
    const user = req.user as any;
    const project = await this.projectService.getProjectsForUser(user.id);
    return project;
  }
}
