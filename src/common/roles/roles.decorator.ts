import { SetMetadata } from '@nestjs/common';
import { RoleType } from '@prisma/client';
import { ROLES_KEY } from './constants';

export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);
