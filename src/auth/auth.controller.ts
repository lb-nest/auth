import {
  Controller,
  Param,
  Post,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request) {
    return this.authService.login(req.user);
  }

  @SetMetadata('allowUserToken', true)
  @UseGuards(JwtAuthGuard)
  @Post('projects/:id/token')
  async createToken(@Param('id') id: string, @Req() req: Request) {
    return this.authService.createToken(req.user, Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post('projects/:id/token/verify')
  async validateToken() {
    return 'ok';
  }
}
