import {
  Controller,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Auth } from 'src/auth/auth.decorator';
import { TokenPayload } from 'src/auth/entities/token-payload.entity';
import { Token } from 'src/auth/entities/token.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PlainToClassInterceptor } from 'src/shared/interceptors/plain-to-class.interceptor';
import { UserWithRole } from 'src/user/entities/user-with-role.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { FindAllUsersForProject } from './dto/find-all-users-for-project.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { ProjectService } from './project.service';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @MessagePattern('projects.create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(Project))
  create(
    @Auth() auth: Omit<TokenPayload, 'project'>,
    @Payload('payload') createProjectDto: CreateProjectDto,
  ): Promise<Project> {
    return this.projectService.create(auth.id, createProjectDto);
  }

  @MessagePattern('projects.createToken')
  @UseGuards(JwtAuthGuard)
  createToken(
    @Auth() auth: Omit<TokenPayload, 'project'>,
    @Payload('payload', ParseIntPipe) id: number,
  ): Promise<Token> {
    return this.projectService.createToken(auth.id, id);
  }

  @MessagePattern('projects.@me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(Project))
  findMe(@Auth() auth: Required<TokenPayload>): Promise<Project> {
    return this.projectService.findMe(auth.id, auth.project.id);
  }

  @MessagePattern('projects.@me.update')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(Project))
  update(
    @Auth() auth: Required<TokenPayload>,
    @Payload('payload') updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    return this.projectService.update(
      auth.id,
      auth.project.id,
      updateProjectDto,
    );
  }

  @MessagePattern('projects.@me.remove')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(Project))
  remove(@Auth() auth: Required<TokenPayload>): Promise<Project> {
    return this.projectService.remove(auth.id, auth.project.id);
  }

  @MessagePattern('projects.@me.inviteUser')
  @UseGuards(JwtAuthGuard)
  inviteUser(
    @Auth() auth: Required<TokenPayload>,
    @Payload('payload') inviteUserDto: InviteUserDto,
  ): Promise<void> {
    return this.projectService.inviteUser(auth.project.id, inviteUserDto);
  }

  @MessagePattern('projects.@me.findAllUsers')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(UserWithRole))
  findAllUsers(
    @Auth() auth: Required<TokenPayload>,
    @Payload('payload') findAllUsersForProject: FindAllUsersForProject,
  ): Promise<UserWithRole[]> {
    return this.projectService.findAllUsers(
      auth.project.id,
      findAllUsersForProject,
    );
  }
}
