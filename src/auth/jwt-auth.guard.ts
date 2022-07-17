import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    context.switchToHttp().getRequest().allowUserToken =
      this.reflector.get<boolean>('allowUserToken', context.getHandler());

    return super.canActivate(context);
  }
}
