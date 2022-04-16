import { Injectable } from '@nestjs/common';
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
      token: await this.jwtService.signAsync(user, {
        expiresIn: '1h',
      }),
    };
  }

  async token(projectId: number, user: any) {
    const token = await this.prismaService.token.upsert({
      where: {
        projectId_userId: {
          projectId,
          userId: user.id,
        },
      },
      create: {
        projectId,
        userId: user.id,
      },
      update: {},
      select: {
        id: true,
        project: {
          select: {
            id: true,
            roles: {
              select: {
                role: true,
              },
            },
            billing: {
              select: {
                id: true,
                type: true,
              },
            },
          },
        },
      },
    });

    return {
      token: await this.jwtService.signAsync(
        {
          id: user.id,
          project: token.project,
        },
        {
          jwtid: String(token.id),
          expiresIn: '30d',
        },
      ),
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
