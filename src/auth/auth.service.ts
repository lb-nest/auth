import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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

  async createToken(user: any, projectId: number) {
    const project = await this.prismaService.project.findFirst({
      where: {
        id: projectId,
        roles: {
          some: {
            userId: user.id,
          },
        },
      },
    });

    if (!project) {
      throw new ForbiddenException();
    }

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
      token: await this.jwtService.signAsync({
        id: user.id,
        project: token.project,
      }),
    };
  }

  async validateToken(payload: any) {
    const token = await this.prismaService.token.findUnique({
      where: {
        projectId_userId: {
          projectId: payload.project.id,
          userId: payload.id,
        },
      },
    });

    if (!token) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
