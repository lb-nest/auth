import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { RoleType } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { User } from 'src/auth/user.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectService } from './project.service';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @SetMetadata('allowUserToken', true)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@User() user: any, @Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(user.id, createProjectDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('@me')
  findOne(@User() user: any) {
    return this.projectService.findOne(user.project.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.Owner)
  @Post('@me/invites')
  invite(@User() user: any, @Body() inviteUserDto: InviteUserDto) {
    return this.projectService.inviteUser(user.project.id, inviteUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.Owner)
  @Patch('@me')
  update(@User() user: any, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(user.project.id, updateProjectDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.Owner)
  @Delete('@me')
  delete(@User() user: any) {
    return this.projectService.delete(user.project.id);
  }
}
