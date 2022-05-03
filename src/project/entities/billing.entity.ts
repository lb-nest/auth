import { BillingType } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class Billing {
  id: number;

  @Exclude()
  projectId: number;

  type: BillingType;
}
