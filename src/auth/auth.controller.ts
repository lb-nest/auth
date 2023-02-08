import { Controller, SerializeOptions, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { JwtAuth } from './decorators/jwt-auth.decorator';
import { SignInDto } from './dto/sign-in.dto';
import { Token } from './entities/token.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Auth } from './interfaces/auth.interface';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SerializeOptions({
    type: Token,
  })
  @MessagePattern('signIn')
  signIn(@Payload() signInDto: SignInDto): Promise<Token> {
    return this.authService.signIn(signInDto);
  }

  @MessagePattern('validateToken')
  @UseGuards(JwtAuthGuard)
  validateToken(@JwtAuth() auth: Auth): Auth {
    return auth;
  }
}
