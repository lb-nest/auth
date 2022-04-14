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
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
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
  @Get('me')
  findOne(@Req() req: any) {
    return this.projectService.findOne(req.user.project.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/invites')
  invite(@Req() req: any, @Body() inviteUserDto: InviteUserDto) {
    return this.projectService.inviteUser(req.user.project.id, inviteUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  update(@Req() req: any, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(req.user.project.id, updateProjectDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  delete(@Req() req: any) {
    return this.projectService.delete(req.user.project.id);
  }
}
