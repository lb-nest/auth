import { IsEmail, IsString } from 'class-validator';

export class CreateProjectUserDto {
  @IsString()
  @IsEmail()
  email: string;
}
