import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RoleType } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectService } from './project.service';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req, @Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(req.user.id, createProjectDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('@me')
  findOne(@Req() req: any) {
    return this.projectService.findOne(req.user.project.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.Owner)
  @Post('@me/invites')
  invite(@Req() req: any, @Body() inviteUserDto: InviteUserDto) {
    return this.projectService.inviteUser(req.user.project.id, inviteUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.Owner)
  @Patch('@me')
  update(@Req() req: any, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(req.user.project.id, updateProjectDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.Owner)
  @Delete('@me')
  delete(@Req() req: any) {
    return this.projectService.delete(req.user.project.id);
  }
}
