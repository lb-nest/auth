import { Controller, ParseIntPipe, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Project } from 'src/project/entities/project.entity';
import { PlainToClassInterceptor } from 'src/shared/interceptors/plain-to-class.interceptor';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('createUser')
  @UseInterceptors(new PlainToClassInterceptor(User))
  create(@Payload() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @MessagePattern('findAllUsers')
  @UseInterceptors(new PlainToClassInterceptor(User))
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @MessagePattern('findOneUser')
  @UseInterceptors(new PlainToClassInterceptor(User))
  findOne(@Payload(ParseIntPipe) id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  @MessagePattern('updateUser')
  @UseInterceptors(new PlainToClassInterceptor(User))
  update(@Payload() updateUserDto: UpdateUserDto): Promise<User> {
    return this.userService.update(updateUserDto);
  }

  @MessagePattern('removeUser')
  @UseInterceptors(new PlainToClassInterceptor(User))
  remove(@Payload(ParseIntPipe) id: number): Promise<User> {
    return this.userService.remove(id);
  }

  @MessagePattern('confirmUser')
  confirm(@Payload() code: string): Promise<boolean> {
    return this.userService.confirm(code);
  }

  @MessagePattern('findAllUserProjects')
  @UseInterceptors(new PlainToClassInterceptor(Project))
  findAllProjects(@Payload(ParseIntPipe) id: number): Promise<Project[]> {
    return this.userService.findAllProjects(id);
  }
}
