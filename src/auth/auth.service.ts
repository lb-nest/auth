import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
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

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<Omit<TokenPayload, 'project'>> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
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
