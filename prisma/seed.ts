import {
  PrismaClient,
  GlobalRole,
  ProjectRole,
  TaskStatus,
  TaskPriority,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding routine...');

  // 1. Clear any existing database rows
  await prisma.comment.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedDefaultPassword = await bcrypt.hash('password123', 10);

  // 2. Create sample users matching Roles
  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@teamsync.local',
      name: 'Alex Manager',
      passwordHash: hashedDefaultPassword,
      role: GlobalRole.MANAGER,
    },
  });

  const memberUser = await prisma.user.create({
    data: {
      email: 'developer@teamsync.local',
      name: 'Sam Developer',
      passwordHash: hashedDefaultPassword,
      role: GlobalRole.MEMBER,
    },
  });

  console.log('Base users established.');

  // 3. Establish a Project
  const project = await prisma.project.create({
    data: {
      name: 'Core Platform Engineering',
      description:
        'Building out Next.js web application and NestJS core microservices.',
      ownerId: managerUser.id,
    },
  });

  // 4. Map Memberships
  await prisma.projectMember.createMany({
    data: [
      {
        projectId: project.id,
        userId: managerUser.id,
        role: ProjectRole.MANAGER,
      },
      {
        projectId: project.id,
        userId: memberUser.id,
        role: ProjectRole.MEMBER,
      },
    ],
  });

  console.log('Project workspaces and memberships synchronized.');

  // 5. Seed Core tasks matching pagination requirements
  await prisma.task.createMany({
    data: [
      {
        projectId: project.id,
        title: 'Draft system security matrix',
        description: 'Validate JWT strategies and refresh rules.',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        assigneeId: managerUser.id,
        dueDate: new Date(),
      },
      {
        projectId: project.id,
        title: 'Configure global exception pipelines',
        description: 'Ensure status structures share unified shapes.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        assigneeId: memberUser.id,
        dueDate: new Date(),
      },
      {
        projectId: project.id,
        title: 'Implement login screen components',
        description: 'Incorporate Inter styling guidelines.',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        assigneeId: memberUser.id,
      },
      {
        projectId: project.id,
        title: 'Wire offline secure device caching',
        description: 'Apply keychain mechanisms.',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        assigneeId: memberUser.id,
      },
      {
        projectId: project.id,
        title: 'Conduct local verification loops',
        description: 'Ensure test sets evaluate cleanly.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
      },
    ],
  });

  console.log('5 sample tasks successfully populated.');
  console.log('Database seeding sequence complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
