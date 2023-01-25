import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsInt } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email']),
) {
  @IsInt()
  id: number;
}
