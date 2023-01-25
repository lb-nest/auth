import Prisma from '@prisma/client';
import { Exclude } from 'class-transformer';

export class ProjectUser implements Prisma.ProjectUser {
  @Exclude()
  userId: number;

  @Exclude()
  projectId: number;

  accessLevel: Prisma.AccessLevel;
}
