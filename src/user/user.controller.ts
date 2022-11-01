import { Controller, UseGuards, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Auth } from 'src/auth/auth.decorator';
import { TokenPayload } from 'src/auth/entities/token-payload.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Project } from 'src/project/entities/project.entity';
import { PlainToClassInterceptor } from 'src/shared/interceptors/plain-to-class.interceptor';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('users.create')
  @UseInterceptors(new PlainToClassInterceptor(User))
  create(@Payload('payload') createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @MessagePattern('users.@me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(User))
  findMe(@Auth() auth: Omit<TokenPayload, 'project'>) {
    return this.userService.findOne(auth.id);
  }

  @MessagePattern('users.@me.findAllProjects')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(Project))
  findAllProjects(@Auth() auth: Omit<TokenPayload, 'project'>) {
    return this.userService.findAllProjects(auth.id);
  }

  @MessagePattern('users.@me.update')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(User))
  update(
    @Auth() auth: Omit<TokenPayload, 'project'>,
    @Payload('payload') updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(auth.id, updateUserDto);
  }

  @MessagePattern('users.@me.remove')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(User))
  remove(@Auth() auth: Omit<TokenPayload, 'project'>) {
    return this.userService.remove(auth.id);
  }

  @MessagePattern('users.@me.confirmEmail')
  confirmEmail(@Payload('payload') code: string) {
    return this.userService.confirmEmail(code);
  }
}
