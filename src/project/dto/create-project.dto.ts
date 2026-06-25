import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    example: 'Mobile App Redesign',
    description: 'The display title of the workspace project',
  })
  @IsString()
  @IsNotEmpty({ message: 'Project name cannot be blank' })
  name!: string;

  @ApiProperty({
    example: 'Migrating legacy assets to clean Expo setups.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
