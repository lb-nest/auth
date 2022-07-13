import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { Token } from './entities/token.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string): Promise<Token> {
    const user = await this.prismaService.user.findUniqueOrThrow({
      where: {
        email,
      },
      select: {
        id: true,
        password: true,
      },
    });

    const result = await compare(password, user.password);
    if (result) {
      delete user.password;
      return {
        token: await this.jwtService.signAsync(user, {
          expiresIn: '1h',
        }),
      };
    }

    return null;
  }
}
