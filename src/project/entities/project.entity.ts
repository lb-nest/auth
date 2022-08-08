import Prisma from '@prisma/client';
import { Type } from 'class-transformer';
import { Role } from 'src/user/entities/role.entity';
import { Billing } from './billing.entity';

export class Project implements Prisma.Project {
  id: number;

  name: string;

  slug: string;

  @Type(() => Billing)
  billing: Billing;

  @Type(() => Role)
  roles: Role[];

  createdAt: Date;

  updatedAt: Date;
}
