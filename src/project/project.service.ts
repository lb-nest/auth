import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccessLevel } from '@prisma/client';
import slugify from 'slugify';
import { Token } from 'src/auth/entities/token.entity';
import { PrismaService } from 'src/prisma.service';
import { User } from 'src/user/entities/user.entity';
import { CreateProjectTokenDto } from './dto/create-project-token.dto';
import { CreateProjectUserDto } from './dto/create-project-user.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { FindAllProjectUsersDto } from './dto/find-all-project-users.dto';
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

  create(userId: number, createProjectDto: CreateProjectDto): Promise<Project> {
    return this.prismaService.project.create({
      data: {
        ...createProjectDto,
        slug: slugify(createProjectDto.name, {
          remove: /[^a-z0-9 ]/gim,
          lower: true,
        }),
        users: {
          create: {
            userId,
            accessLevel: AccessLevel.Owner,
          },
        },
      },
      include: {
        users: {
          where: {
            userId,
          },
        },
      },
    });
  }

  findAll(): Promise<Project[]> {
    return this.prismaService.project.findMany({
      where: {},
      include: {
        users: {
          where: {
            accessLevel: AccessLevel.Owner,
          },
        },
      },
    });
  }

  findOne(
    userId: number,
    id: number,
    accessLevel?: AccessLevel,
  ): Promise<Project> {
    return this.prismaService.project.findFirstOrThrow({
      where: {
        id,
        users: {
          some: {
            userId,
            accessLevel,
          },
        },
      },
      include: {
        users: {
          where: {
            userId,
          },
        },
      },
    });
  }

  async update(
    userId: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    await this.findOne(userId, updateProjectDto.id, AccessLevel.Owner);

    return this.prismaService.project.update({
      where: {
        id: updateProjectDto.id,
      },
      data: updateProjectDto,
      include: {
        users: {
          where: {
            userId,
          },
        },
      },
    });
  }

  async remove(userId: number, id: number): Promise<Project> {
    await this.findOne(userId, id, AccessLevel.Owner);

    return this.prismaService.project.delete({
      where: {
        id,
      },
      include: {
        users: {
          where: {
            userId,
          },
        },
      },
    });
  }

  async createToken(
    userId: number,
    createProjectTokenDto: CreateProjectTokenDto,
  ): Promise<Token> {
    const token = await this.prismaService.token.upsert({
      where: {
        projectId_userId: {
          userId,
          projectId: createProjectTokenDto.id,
        },
      },
      create: {
        userId,
        projectId: createProjectTokenDto.id,
      },
      update: {},
      select: {
        project: {
          select: {
            id: true,
            users: {
              where: {
                userId,
              },
              select: {
                accessLevel: true,
              },
            },
          },
        },
      },
    });

    return {
      token: await this.jwtService.signAsync({
        id: userId,
        project: {
          id: token.project.id,
        },
      }),
    };
  }

  async createUser(
    projectId: number,
    createProjectUserDto: CreateProjectUserDto,
  ): Promise<boolean> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: createProjectUserDto.email,
      },
    });

    if (user) {
      await this.prismaService.projectUser.create({
        data: {
          projectId,
          userId: user.id,
        },
      });
    } else {
      await this.prismaService.invite.create({
        data: {
          projectId,
          ...createProjectUserDto,
        },
      });
    }

    await this.mailerService.sendMail({
      subject: 'New invitation to the project',
      to: createProjectUserDto.email,
      template: 'invitation',
      context: {
        url: this.configService.get<string>('FRONTEND_URL'),
      },
    });

    return true;
  }

  async findAllUsers(
    projectId: number,
    findAllProjectUsersDto: FindAllProjectUsersDto,
  ): Promise<User[]> {
    return this.prismaService.user.findMany({
      where: {
        id: {
          in: findAllProjectUsersDto.ids,
        },
        projects: {
          some: {
            projectId,
          },
        },
      },
    });
  }
}
