import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';
import { PrismaService } from 'src/prisma.service';
import { TokenPayload } from './entities/token-payload.entity';
import { Token } from './entities/token.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(payload: Omit<TokenPayload, 'project'>): Promise<Token> {
    return {
      token: await this.jwtService.signAsync(payload, {
        expiresIn: '1h',
      }),
    };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<TokenPayload, 'project'>> {
    const user = await this.prismaService.user.findUnique({
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

    const result = await bcrypt.compare(password, user.password);
    if (result) {
      delete user.password;
      return user;
    }

    return null;
  }

  async createToken(
    user: Omit<TokenPayload, 'project'>,
    projectId: number,
  ): Promise<Token> {
    const roles = await this.prismaService.project
      .findUnique({
        where: {
          id: projectId,
        },
      })
      .roles({
        where: {
          userId: user.id,
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
            include: {
              roles: true,
              billing: true,
            },
          },
        },
      }),
    );

    return {
      token: await this.jwtService.signAsync({
        id: user.id,
        project: token.project,
      }),
    };
  }

  async validateToken(payload: TokenPayload): Promise<Required<TokenPayload>> {
    if (!payload.project) {
      throw new UnauthorizedException();
    }

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

    return payload as Required<TokenPayload>;
  }
}
