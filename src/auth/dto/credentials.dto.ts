import { IsEmail, IsString } from 'class-validator';

export class Credentials {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
