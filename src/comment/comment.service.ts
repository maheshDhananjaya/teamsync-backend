import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async addComment(
    taskId: string,
    createCommentDto: CreateCommentDto,
    authorId: string,
  ) {
    return this.prisma.comment.create({
      data: {
        body: createCommentDto.body,
        taskId: taskId,
        authorId: authorId,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });
  }
}
