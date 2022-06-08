import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { BillingType, RoleType } from '@prisma/client';
import { plainToClass } from 'class-transformer';
import slugify from 'slugify';
import { TokenPayload } from 'src/auth/entities/token-payload.entity';
import { Token } from 'src/auth/entities/token.entity';
import { PrismaService } from 'src/prisma.service';
import { UserWithRole } from 'src/user/entities/user-with-role.entity';
import { CreateInviteDto } from './dto/create-invite.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
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

  async createToken(projectId: number, userId: number): Promise<Token> {
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

    if (roles.length === 0) {
      throw new ForbiddenException();
    }

    const token = plainToClass(
      TokenPayload,
      await this.prismaService.token.upsert({
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
            include: {
              roles: {
                where: {
                  userId,
                },
              },
              billing: true,
            },
          },
        },
      }),
    );

    return {
      token: await this.jwtService.signAsync({
        id: userId,
        project: token.project,
      }),
    };
  }

  async createInvite(
    projectId: number,
    createInviteDto: CreateInviteDto,
  ): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: createInviteDto.email,
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
        ...createInviteDto,
      },
    });

    await this.mailerService.sendMail({
      subject: 'New invitation to the project',
      to: createInviteDto.email,
      template: 'invitation',
      context: {
        url: this.configService.get<string>('FRONTEND_URL'),
      },
    });
  }

  async findUsers(projectId: number, ids?: number[]): Promise<UserWithRole[]> {
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
