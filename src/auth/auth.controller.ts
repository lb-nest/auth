import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { Auth } from './auth.decorator';
import { AuthService } from './auth.service';
import { TokenPayload } from './entities/token-payload.entity';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  @HttpCode(200)
  login(@Auth() user: Omit<TokenPayload, 'project'>) {
    return this.authService.login(user);
  }
}
