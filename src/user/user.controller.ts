import { Controller, UseFilters, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TokenPayload } from 'src/auth/entities/token-payload.entity';
import { User } from 'src/auth/user.decorator';
import { Project } from 'src/project/entities/project.entity';
import { ExceptionFilter } from 'src/shared/filters/exception.filter';
import { TransformInterceptor } from 'src/shared/interceptors/transform.interceptor';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User as UserEntity } from './entities/user.entity';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('users.create')
  @UseFilters(ExceptionFilter)
  @UseInterceptors(new TransformInterceptor(UserEntity))
  create(@Payload('data') createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @MessagePattern('users.@me')
  @UseInterceptors(new TransformInterceptor(UserEntity))
  findMe(@User() user: Omit<TokenPayload, 'project'>) {
    return this.userService.findOne(user.id);
  }

  @MessagePattern('users.@me.projects')
  @UseInterceptors(new TransformInterceptor(Project))
  findAllProjects(@User() user: Omit<TokenPayload, 'project'>) {
    return this.userService.findAllProjects(user.id);
  }

  @MessagePattern('users.@me.update')
  @UseInterceptors(new TransformInterceptor(UserEntity))
  update(
    @User() user: Omit<TokenPayload, 'project'>,
    @Payload('data') updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(user.id, updateUserDto);
  }

  @MessagePattern('users.@me.remove')
  @UseInterceptors(new TransformInterceptor(UserEntity))
  remove(@User() user: Omit<TokenPayload, 'project'>) {
    return this.userService.remove(user.id);
  }

  @MessagePattern('users.@me.confirm')
  confirmEmail(@Payload('data') code: string) {
    return this.userService.confirmEmail(code);
  }
}
