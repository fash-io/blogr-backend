import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  bio: string;

  @IsString()
  @IsNotEmpty()
  about: string;

  @IsString()
  @IsNotEmpty()
  website: string;

  @IsString()
  @IsNotEmpty()
  linkedIn: string;

  @IsString()
  @IsNotEmpty()
  github: string;

  @IsEnum(['MALE', 'FEMALE', 'OTHER '])
  gender: 'MALE' | 'FEMALE' | 'OTHER';

  @IsString()
  @IsNotEmpty()
  avatar: string | null;
}

export class UpdateProfileDto extends PartialType(CreateProfileDto) {}
