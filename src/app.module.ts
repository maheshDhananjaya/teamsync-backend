import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes environment configurations accessible everywhere without manual imports
    }),
    PrismaModule,
    AuthModule,
    ProjectModule,
    TaskModule,
    CommentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
