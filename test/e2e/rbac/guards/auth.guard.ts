import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const role = request.headers.role;

    if (role === 'admin') {
      request.user = {
        role: 'admin',
      };
      return true;
    }

    if (role === 'user') {
      request.user = {
        role: 'user',
      };
      return true;
    }

    return false;
  }
}
