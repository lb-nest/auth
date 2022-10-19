import { MailerService } from '@nestjs-modules/mailer';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { BillingType, RoleType } from '@prisma/client';
import slugify from 'slugify';
import { Token } from 'src/auth/entities/token.entity';
import { PrismaService } from 'src/prisma.service';
import { UserWithRole } from 'src/user/entities/user-with-role.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { FindAllUsersForProject } from './dto/find-all-users-for-project.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async create(
    userId: number,
    createProjectDto: CreateProjectDto,
  ): Promise<Project> {
    return this.prismaService.project.create({
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
        roles: {
          where: {
            userId,
          },
        },
      },
    });
  }

  async createToken(userId: number, projectId: number): Promise<Token> {
    const roles = await this.prismaService.project
      .findUnique({
        where: {
          id: projectId,
        },
      })
      .roles({
        where: {
          userId,
        },
        include: {
          project: true,
        },
      });

    if (!roles?.length) {
      throw new ForbiddenException();
    }

    const token = await this.prismaService.token.upsert({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      create: {
        projectId,
        userId,
      },
      update: {},
      select: {
        project: {
          select: {
            id: true,
            roles: {
              where: {
                userId,
              },
              select: {
                role: true,
              },
            },
            billing: {
              select: {
                type: true,
              },
            },
          },
        },
      },
    });

    return {
      token: await this.jwtService.signAsync({
        id: userId,
        project: token.project,
      }),
    };
  }

  async findMe(userId: number, id: number): Promise<Project> {
    return this.prismaService.project.findUniqueOrThrow({
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
  }

  async update(
    userId: number,
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
        roles: {
          where: {
            userId,
          },
        },
      },
    });
  }

  async remove(userId: number, id: number): Promise<Project> {
    return this.prismaService.project.delete({
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

  async findAllUsers(
    projectId: number,
    findAllUsersForProject: FindAllUsersForProject,
  ): Promise<UserWithRole[]> {
    return this.prismaService.user.findMany({
      where: {
        id: {
          in: findAllUsersForProject.ids,
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
  }
}
