import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { JwtPayload } from '../common/types';
import { AuthedRequest } from './jwt-auth.guard';

/** Injects the decoded JWT payload (or undefined on optional-auth routes). */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload | undefined =>
    ctx.switchToHttp().getRequest<AuthedRequest>().user,
);
