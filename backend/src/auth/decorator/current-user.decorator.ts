import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

type RequestWithUser = Request & {
  user?: unknown;
};

const getCurrentUserByContext = (context: ExecutionContext): unknown => {
  const request = context.switchToHttp().getRequest<RequestWithUser>();
  return request.user;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): unknown => {
    return getCurrentUserByContext(context);
  },
);
