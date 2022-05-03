import { Type } from 'class-transformer';
import { User } from 'src/user/entities/user.entity';
import { Role } from './role.entity';

export class UserWithRole extends User {
  @Type(() => Role)
  roles: Role[];
}
