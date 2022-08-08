import Prisma from '@prisma/client';
import { Exclude } from 'class-transformer';

export class Role implements Prisma.Role {
  @Exclude()
  userId: number;

  @Exclude()
  projectId: number;

  role: Prisma.RoleType;
}
