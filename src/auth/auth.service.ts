import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: any) {
    return {
      token: await this.jwtService.signAsync(user),
    };
  }

  async token(id: number, user: any) {
    const project = await this.prismaService.project.findFirst({
      where: {
        id,
        roles: {
          some: {
            userId: user.id,
          },
        },
      },
      select: {
        id: true,
        roles: {
          select: {
            role: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException();
    }

    return {
      token: await this.jwtService.signAsync({
        ...user,
        project,
      }),
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      return null;
    }

    const compareResult = await bcrypt.compare(password, user.password);
    if (compareResult) {
      delete user.password;
      return user;
    }

    return null;
  }
}
