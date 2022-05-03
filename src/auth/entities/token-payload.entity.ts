import { BillingType, RoleType } from '@prisma/client';

export class TokenPayload {
  id: number;
  email: string;
  project?: {
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
