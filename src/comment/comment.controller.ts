import { Controller, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Comment Module')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller()
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Post('tasks/:taskId/comments')
  @ApiOperation({ summary: 'Append a new comment entry to a task thread' })
  create(
    @Param('taskId') taskId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req,
  ) {
    const user = req.user as any;
    return this.commentService.addComment(taskId, createCommentDto, user.id);
  }
}
