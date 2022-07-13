import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { Credentials } from './dto/credentials.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.signin')
  signIn(@Payload('data') credentials: Credentials) {
    return this.authService.signIn(credentials.email, credentials.password);
  }
}
