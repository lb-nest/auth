import { Type } from 'class-transformer';
import { Role } from 'src/user/entities/role.entity';
import { Project } from './project.entity';

export class ProjectWithRole extends Project {
  @Type(() => Role)
  roles: Role[];
}
