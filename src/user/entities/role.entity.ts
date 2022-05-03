import { RoleType } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class Role {
  @Exclude()
  userId: number;

  @Exclude()
  projectId: number;

  role: RoleType;
}
