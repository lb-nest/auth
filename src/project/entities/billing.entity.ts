import Prisma from '@prisma/client';
import { Exclude } from 'class-transformer';

export class Billing implements Prisma.Billing {
  @Exclude()
  projectId: number;

  type: Prisma.BillingType;
}
