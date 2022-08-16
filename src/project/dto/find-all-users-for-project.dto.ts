import { IsInt, IsOptional } from 'class-validator';

export class FindAllUsersForProject {
  @IsOptional()
  @IsInt({ each: true })
  ids?: number[];
}
