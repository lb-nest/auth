import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TokenPayload } from 'src/auth/entities/token-payload.entity';
import { User } from 'src/auth/user.decorator';
import { TransformInterceptor } from 'src/shared/interceptors/transform.interceptor';
import { UserWithRole } from 'src/user/entities/user-with-role.entity';
import { CreateInviteDto } from './dto/create-invite.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { ProjectService } from './project.service';

@Controller()
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @MessagePattern('projects.create')
  @UseInterceptors(new TransformInterceptor(Project))
  create(
    @User() user: Omit<TokenPayload, 'project'>,
    @Payload('data') createProjectDto: CreateProjectDto,
  ) {
    return this.projectService.create(user.id, createProjectDto);
  }

  @MessagePattern('projects.@me')
  @UseInterceptors(new TransformInterceptor(Project))
  findMe(@User() user: Required<TokenPayload>) {
    return this.projectService.findMe(user.project.id, user.id);
  }

  @MessagePattern('projects.@me.update')
  @UseInterceptors(new TransformInterceptor(Project))
  update(
    @User() user: Required<TokenPayload>,
    @Payload('data') updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectService.update(user.project.id, updateProjectDto);
  }

  @MessagePattern('projects.@me.remove')
  @UseInterceptors(new TransformInterceptor(Project))
  remove(@User() user: Required<TokenPayload>) {
    return this.projectService.remove(user.project.id);
  }

  @MessagePattern('projects.@me.users.invite')
  createInvite(
    @User() user: Required<TokenPayload>,
    @Payload('payload') createInviteDto: CreateInviteDto,
  ) {
    return this.projectService.createInvite(user.project.id, createInviteDto);
  }

  @MessagePattern('projects.@me.users.findAll')
  @UseInterceptors(new TransformInterceptor(UserWithRole))
  findAllUsers(
    @User() user: Required<TokenPayload>,
    @Payload('data') ids?: number[],
  ) {
    return this.projectService.findAllUsers(user.project.id, ids);
  }

  @MessagePattern('projects.token')
  createToken(
    @User() user: Omit<TokenPayload, 'project'>,
    @Payload('data') id: number,
  ) {
    return this.projectService.createToken(id, user.id);
  }

  @MessagePattern('projects.@me.token.verify')
  async validateToken(@User() user: TokenPayload): Promise<TokenPayload> {
    return user;
  }
}
