import { Controller, ParseIntPipe, SerializeOptions } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Token } from 'src/auth/entities/token.entity';
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

  @SerializeOptions({
    type: Project,
  })
  @MessagePattern('createProject')
  create(
    @Payload('userId', ParseIntPipe) userId: number,
    @Payload() createProjectDto: CreateProjectDto,
  ): Promise<Project> {
    return this.projectService.create(userId, createProjectDto);
  }

  @SerializeOptions({
    type: Project,
  })
  @MessagePattern('findAllProjects')
  findAll(): Promise<Project[]> {
    return this.projectService.findAll();
  }

  @SerializeOptions({
    type: Project,
  })
  @MessagePattern('findOneProject')
  findOne(
    @Payload('userId', ParseIntPipe) userId: number,
    @Payload('id', ParseIntPipe) id: number,
  ): Promise<Project> {
    return this.projectService.findOne(userId, id);
  }

  @SerializeOptions({
    type: Project,
  })
  @MessagePattern('updateProject')
  update(
    @Payload('userId', ParseIntPipe) userId: number,
    @Payload() updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    return this.projectService.update(userId, updateProjectDto);
  }

  @SerializeOptions({
    type: Project,
  })
  @MessagePattern('removeProject')
  remove(
    @Payload('userId', ParseIntPipe) userId: number,
    @Payload('id', ParseIntPipe) id: number,
  ): Promise<Project> {
    return this.projectService.remove(userId, id);
  }

  @SerializeOptions({
    type: Token,
  })
  @MessagePattern('createProjectToken')
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

  @SerializeOptions({
    type: User,
  })
  @MessagePattern('findAllProjectUsers')
  findAllUsers(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() findAllProjectUsersDto: FindAllProjectUsersDto,
  ): Promise<User[]> {
    return this.projectService.findAllUsers(projectId, findAllProjectUsersDto);
  }
}
