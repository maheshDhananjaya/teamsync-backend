import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    example:
      'Finished building out the exception filters. Code is ready for review.',
    description: 'The plain text message of the comment body',
  })
  @IsString()
  @IsNotEmpty({ message: 'Comment content cannot be empty' })
  body!: string;
}
