import { Optional } from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { IsUrl } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsUrl()
  @Optional()
  avatarUrl?: string;
}
