import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  SetMetadata,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RoleType } from '@prisma/client';
import { Auth } from 'src/auth/auth.decorator';
import { TokenPayload } from 'src/auth/entities/token-payload.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { TransformInterceptor } from 'src/shared/interceptors/transform.interceptor';
import { UserWithRole } from 'src/user/entities/user-with-role.entity';
import { CreateInviteDto } from './dto/create-invite.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { ProjectService } from './project.service';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @SetMetadata('allowUserToken', true)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(Project))
  @Post()
  create(
    @Auth() user: Omit<TokenPayload, 'project'>,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return this.projectService.create(user.id, createProjectDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(Project))
  @Get('@me')
  findOne(@Auth() user: Required<TokenPayload>) {
    return this.projectService.findOne(user.project.id, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.Owner)
  @UseInterceptors(new TransformInterceptor(Project))
  @Patch('@me')
  update(
    @Auth() user: Required<TokenPayload>,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectService.update(user.project.id, updateProjectDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.Owner)
  @UseInterceptors(new TransformInterceptor(Project))
  @Delete('@me')
  delete(@Auth() user: Required<TokenPayload>) {
    return this.projectService.delete(user.project.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.Owner)
  @Post('@me/users')
  @HttpCode(204)
  createInvite(
    @Auth() user: Required<TokenPayload>,
    @Body() createInviteDto: CreateInviteDto,
  ) {
    return this.projectService.createInvite(user.project.id, createInviteDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(UserWithRole))
  @Get('@me/users')
  findUsers(@Auth() user: Required<TokenPayload>, @Query('ids') ids?: string) {
    return this.projectService.findUsers(
      user.project.id,
      ids?.split(',').map(Number),
    );
  }

  @SetMetadata('allowUserToken', true)
  @UseGuards(JwtAuthGuard)
  @Get(':id/token')
  @HttpCode(200)
  createToken(
    @Param('id') id: string,
    @Auth() user: Omit<TokenPayload, 'project'>,
  ) {
    return this.projectService.createToken(Number(id), user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('@me/token/verify')
  @HttpCode(204)
  validateToken(): Promise<void> {
    return;
  }
}
