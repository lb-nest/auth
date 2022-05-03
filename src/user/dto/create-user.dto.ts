import { Prisma } from '@prisma/client';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto implements Prisma.UserCreateInput {
  @IsEmail()
  email: string;

  @MinLength(8)
  @MaxLength(64)
  password: string;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value.trim())
  name: string;
}
