import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Auth } from './auth.decorator';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { TokenPayload } from './entities/token-payload.entity';
import { Token } from './entities/token.entity';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.signIn')
  signIn(@Payload('payload') signinDto: SigninDto): Promise<Token> {
    return this.authService.signIn(signinDto);
  }

  @MessagePattern('auth.validateToken')
  @UseGuards(JwtAuthGuard)
  validateToken(@Auth() auth: TokenPayload): TokenPayload {
    return auth;
  }
}
