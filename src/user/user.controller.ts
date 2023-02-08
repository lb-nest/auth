import { Controller, ParseIntPipe, SerializeOptions } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Project } from 'src/project/entities/project.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @SerializeOptions({
    type: User,
  })
  @MessagePattern('createUser')
  create(@Payload() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @SerializeOptions({
    type: User,
  })
  @MessagePattern('findAllUsers')
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @SerializeOptions({
    type: User,
  })
  @MessagePattern('findOneUser')
  findOne(@Payload(ParseIntPipe) id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  @SerializeOptions({
    type: User,
  })
  @MessagePattern('updateUser')
  update(@Payload() updateUserDto: UpdateUserDto): Promise<User> {
    return this.userService.update(updateUserDto);
  }

  @SerializeOptions({
    type: User,
  })
  @MessagePattern('removeUser')
  remove(@Payload(ParseIntPipe) id: number): Promise<User> {
    return this.userService.remove(id);
  }

  @MessagePattern('confirmUser')
  confirm(@Payload() code: string): Promise<boolean> {
    return this.userService.confirm(code);
  }

  @SerializeOptions({
    type: Project,
  })
  @MessagePattern('findAllUserProjects')
  findAllProjects(@Payload(ParseIntPipe) id: number): Promise<Project[]> {
    return this.userService.findAllProjects(id);
  }
}
