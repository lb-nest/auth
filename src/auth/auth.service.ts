import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { SignInDto } from './dto/sign-in.dto';
import { Token } from './entities/token.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto): Promise<Token> {
    const user = await this.prismaService.user.findUniqueOrThrow({
      where: {
        email: signInDto.email,
      },
      select: {
        id: true,
        password: true,
      },
    });

    const result = await compare(signInDto.password, user.password);
    if (result) {
      delete user.password;
      return {
        token: await this.jwtService.signAsync(user, {
          expiresIn: '1h',
        }),
      };
    }

    throw new UnauthorizedException();
  }
}
