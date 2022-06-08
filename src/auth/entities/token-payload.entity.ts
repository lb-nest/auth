import { BillingType, RoleType } from '@prisma/client';

export class TokenPayload {
  id: number;
  project: {
    id: number;
    billing: {
      id: number;
      type: BillingType;
    };
    roles: Array<{
      role: RoleType;
    }>;
  };
}
