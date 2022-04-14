import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

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

    return user;
  }

  async findOne(id: number) {
    return this.prismaService.user.findUnique({
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
}
