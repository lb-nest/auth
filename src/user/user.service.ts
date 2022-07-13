import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { Project } from 'src/project/entities/project.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.prismaService.user.create({
      data: {
        ...createUserDto,
        password: await bcrypt.hash(createUserDto.password, 10),
      },
    });

    const invites = await this.prismaService.invite.findMany({
      where: {
        email: createUserDto.email,
      },
    });

    if (invites.length > 0) {
      await this.prismaService.$transaction([
        this.prismaService.role.createMany({
          data: invites.map(({ projectId }) => ({
            projectId,
            userId: user.id,
          })),
        }),
        this.prismaService.invite.deleteMany({
          where: {
            email: createUserDto.email,
          },
        }),
      ]);
    }

    const url = this.configService.get<string>('FRONTEND_URL');
    const code = await this.jwtService.signAsync({
      id: user.id,
    });

    await this.mailerService.sendMail({
      subject: 'Email confirmation',
      to: user.email,
      template: 'confirmation',
      context: {
        name: user.name,
        url: url.concat(`/confirm?code=${code}`),
      },
    });

    return user;
  }

  async findOne(id: number): Promise<User> {
    return this.prismaService.user.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
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
    });
  }

  async remove(id: number): Promise<User> {
    return this.prismaService.user.delete({
      where: {
        id,
      },
    });
  }

  async findAllProjects(id: number): Promise<Project[]> {
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
      include: {
        billing: true,
        roles: true,
      },
    });
  }

  async confirmEmail(code: string): Promise<void> {
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
