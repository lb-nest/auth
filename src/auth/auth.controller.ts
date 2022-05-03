import {
  Controller,
  HttpCode,
  Param,
  Post,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Auth } from './auth.decorator';
import { AuthService } from './auth.service';
import { TokenPayload } from './entities/token-payload.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  login(@Auth() user: Omit<TokenPayload, 'project'>) {
    return this.authService.login(user);
  }

  @SetMetadata('allowUserToken', true)
  @UseGuards(JwtAuthGuard)
  @Post('projects/:id/token')
  @HttpCode(200)
  createToken(
    @Param('id') id: string,
    @Auth() user: Omit<TokenPayload, 'project'>,
  ) {
    return this.authService.createToken(user, Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post('projects/@me/token/verify')
  @HttpCode(204)
  validateToken(): Promise<void> {
    return;
  }
}
