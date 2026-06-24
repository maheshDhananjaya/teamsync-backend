import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectRole } from '@prisma/client';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  // 1. Create a project and auto-assign the creator as the Project Manager
  async createProject(createProjectDto: CreateProjectDto, ownerId: string) {
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name: createProjectDto.name,
          description: createProjectDto.description,
          ownerId: ownerId,
        },
      });

      // Establish explicit membership for the creator as a MANAGER
      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId: ownerId,
          role: ProjectRole.MANAGER,
        },
      });

      return project;
    });
  }

  // 2. Fetch all projects where the active authenticated user is an explicit member
  async getProjectsForUser(userId: string) {
    return this.prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });
  }
}
