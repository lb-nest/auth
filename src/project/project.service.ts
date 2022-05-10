import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BillingType, RoleType } from '@prisma/client';
import slugify from 'slugify';
import { PrismaService } from 'src/prisma.service';
import { UserWithRole } from 'src/user/entities/user-with-role.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async create(
    userId: number,
    createProjectDto: CreateProjectDto,
  ): Promise<Project> {
    const project = await this.prismaService.project
      .create({
        data: {
          ...createProjectDto,
          slug: slugify(createProjectDto.name, {
            remove: /[^a-z0-9 ]/i,
            lower: true,
          }),
          billing: {
            create: {
              type: BillingType.Free,
            },
          },
          roles: {
            create: {
              userId,
              role: RoleType.Owner,
            },
          },
        },
        include: {
          billing: true,
          roles: true,
        },
      })
      .catch(() => undefined);

    if (!project) {
      throw new ConflictException();
    }

    return project;
  }

  async findOne(id: number, userId: number): Promise<Project> {
    const project = await this.prismaService.project.findUnique({
      where: {
        id,
      },
      include: {
        billing: true,
        roles: {
          where: {
            userId,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException();
    }

    return project;
  }

  async inviteUser(
    projectId: number,
    inviteUserDto: InviteUserDto,
  ): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: inviteUserDto.email,
      },
    });

    if (user) {
      await this.prismaService.role.create({
        data: {
          projectId,
          userId: user.id,
        },
      });

      return;
    }

    await this.prismaService.invite.create({
      data: {
        projectId,
        ...inviteUserDto,
      },
    });

    await this.mailerService.sendMail({
      subject: 'New invitation to the project',
      to: inviteUserDto.email,
      template: 'invitation',
      context: {
        url: this.configService.get<string>('FRONTEND_URL'),
      },
    });
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    return this.prismaService.project.update({
      where: {
        id,
      },
      data: updateProjectDto,
      include: {
        billing: true,
        roles: true,
      },
    });
  }

  async delete(id: number): Promise<Project> {
    return this.prismaService.project.delete({
      where: {
        id,
      },
      include: {
        billing: true,
        roles: true,
      },
    });
  }

  async findAllUsers(
    projectId: number,
    ids?: number[],
  ): Promise<UserWithRole[]> {
    try {
      return await this.prismaService.user.findMany({
        where: {
          id: {
            in: ids,
          },
          roles: {
            some: {
              projectId,
            },
          },
        },
        include: {
          roles: true,
        },
      });
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
