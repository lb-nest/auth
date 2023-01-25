import { ProjectUser } from 'src/project/entities/project-user.entity';

export interface Auth {
  id: number;
  project?: {
    id: number;
    roles: ProjectUser[];
  };
}
