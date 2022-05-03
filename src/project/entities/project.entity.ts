import { Type } from 'class-transformer';
import { Billing } from './billing.entity';

export class Project {
  id: number;

  name: string;

  slug: string;

  @Type(() => Billing)
  billing: Billing;

  createdAt: Date;

  updatedAt: Date;
}
