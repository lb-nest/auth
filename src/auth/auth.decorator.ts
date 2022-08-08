import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Auth = createParamDecorator((_, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().user;
});
