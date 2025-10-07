import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Cookie = createParamDecorator((data: [string, boolean], context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest<Request>();
  const [key, isSigned] = data;
  if (key) {
    return isSigned ? req.signedCookies[key] : req.cookies;
  }
  return req.cookies ?? req.signedCookies;
});
