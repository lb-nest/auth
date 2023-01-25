import { Controller, ParseIntPipe, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Token } from 'src/auth/entities/token.entity';
import { PlainToClassInterceptor } from 'src/shared/interceptors/plain-to-class.interceptor';
import { User } from 'src/user/entities/user.entity';
import { CreateProjectTokenDto } from './dto/create-project-token.dto';
import { CreateProjectUserDto } from './dto/create-project-user.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { FindAllProjectUsersDto } from './dto/find-all-project-users.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { ProjectService } from './project.service';

@Controller()
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @MessagePattern('createProject')
  @UseInterceptors(new PlainToClassInterceptor(Project))
  create(
    @Payload('userId', ParseIntPipe) userId: number,
    @Payload() createProjectDto: CreateProjectDto,
  ): Promise<Project> {
    return this.projectService.create(userId, createProjectDto);
  }

  @MessagePattern('findAllProjects')
  @UseInterceptors(new PlainToClassInterceptor(Project))
  findAll(): Promise<Project[]> {
    return this.projectService.findAll();
  }

  @MessagePattern('findOneProject')
  @UseInterceptors(new PlainToClassInterceptor(Project))
  findOne(
    @Payload('userId', ParseIntPipe) userId: number,
    @Payload('id', ParseIntPipe) id: number,
  ): Promise<Project> {
    return this.projectService.findOne(userId, id);
  }

  @MessagePattern('updateProject')
  @UseInterceptors(new PlainToClassInterceptor(Project))
  update(
    @Payload('userId', ParseIntPipe) userId: number,
    @Payload() updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    return this.projectService.update(userId, updateProjectDto);
  }

  @MessagePattern('removeProject')
  @UseInterceptors(new PlainToClassInterceptor(Project))
  remove(
    @Payload('userId', ParseIntPipe) userId: number,
    @Payload('id', ParseIntPipe) id: number,
  ): Promise<Project> {
    return this.projectService.remove(userId, id);
  }

  @MessagePattern('createProjectToken')
  @UseInterceptors(new PlainToClassInterceptor(Token))
  createToken(
    @Payload('userId', ParseIntPipe) userId: number,
    @Payload() createProjectTokenDto: CreateProjectTokenDto,
  ): Promise<Token> {
    return this.projectService.createToken(userId, createProjectTokenDto);
  }

  @MessagePattern('createProjectUser')
  createProjectUser(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() createProjectUserDto: CreateProjectUserDto,
  ): Promise<boolean> {
    return this.projectService.createUser(projectId, createProjectUserDto);
  }

  @MessagePattern('findAllProjectUsers')
  @UseInterceptors(new PlainToClassInterceptor(User))
  findAllUsers(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() findAllProjectUsersDto: FindAllProjectUsersDto,
  ): Promise<User[]> {
    return this.projectService.findAllUsers(projectId, findAllProjectUsersDto);
  }
}
