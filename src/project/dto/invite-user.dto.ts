import { IsEmail, IsString } from 'class-validator';

export class InviteUserDto {
  @IsString()
  @IsEmail()
  email: string;
}
