import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.prismaService.user.create({
      data: {
        ...createUserDto,
        password: await bcrypt.hash(createUserDto.password, 10),
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        email: true,
        confirmed: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const invites = await this.prismaService.invite.findMany({
      where: {
        email: createUserDto.email,
      },
    });

    if (invites.length > 0) {
      await this.prismaService.userRole.createMany({
        data: invites.map(({ projectId }) => ({
          projectId,
          userId: user.id,
        })),
      });

      await this.prismaService.invite.deleteMany({
        where: {
          email: createUserDto.email,
        },
      });
    }

    const url = this.configService.get<string>('FRONTEND_URL');
    const code = await this.jwtService.signAsync({
      id: user.id,
    });

    await this.mailerService.sendMail({
      subject: 'Welcome to Leadball! Confirm your Email',
      to: user.email,
      template: 'confirmation',
      context: {
        name: user.name,
        url: url.concat(`/confirm?code=${code}`),
      },
    });

    return user;
  }

  async findAll(projectId: number, ids?: number[]) {
    return this.prismaService.user.findMany({
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
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        email: true,
        confirmed: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: number, projectId?: number) {
    return this.prismaService.user.findFirst({
      where: {
        id,
        roles: {
          some: {
            projectId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        email: true,
        confirmed: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getProjects(id: number) {
    return this.prismaService.project.findMany({
      where: {
        roles: {
          some: {
            user: {
              id,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        billing: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          select: {
            role: true,
          },
        },
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        ...updateUserDto,
        password: updateUserDto.password
          ? await bcrypt.hash(updateUserDto.password, 10)
          : undefined,
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        email: true,
        confirmed: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: number) {
    return this.prismaService.user.delete({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        email: true,
        confirmed: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async confirmEmail(code: string) {
    const user = await this.jwtService.verifyAsync(code);

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        confirmed: true,
      },
    });
  }
}
