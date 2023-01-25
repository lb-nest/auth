import { IsInt } from 'class-validator';

export class CreateProjectTokenDto {
  @IsInt()
  id: number;
}
