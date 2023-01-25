import Prisma from '@prisma/client';
import { Type } from 'class-transformer';
import { ProjectUser } from 'src/project/entities/project-user.entity';

export class Project implements Prisma.Project {
  id: number;

  name: string;

  slug: string;

  @Type(() => ProjectUser)
  users: ProjectUser[];

  createdAt: Date;

  updatedAt: Date;
}
