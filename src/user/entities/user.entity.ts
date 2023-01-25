import Prisma from '@prisma/client';
import { Exclude } from 'class-transformer';

export class User implements Prisma.User {
  id: number;

  name: string;

  avatarUrl: string | null;

  email: string;

  phone: string | null;

  @Exclude()
  password: string;

  confirmed: boolean;

  createdAt: Date;

  updatedAt: Date;
}
