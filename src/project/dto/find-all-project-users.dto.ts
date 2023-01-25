import { IsInt, IsOptional } from 'class-validator';

export class FindAllProjectUsersDto {
  @IsOptional()
  @IsInt({ each: true })
  ids?: number[];
}
