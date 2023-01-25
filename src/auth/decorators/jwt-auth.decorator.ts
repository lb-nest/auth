import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const JwtAuth = createParamDecorator((_, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().user;
});
