import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, IsUrl } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email']),
) {
  @IsOptional()
  @IsString()
  @IsUrl()
  avatarUrl?: string;
}
