import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetProfileId = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const id = request.headers['profile-id'];

    return data ? id?.[data] : id;
  },
);
