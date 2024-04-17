import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from 'src/decorators/public.routes.decorator';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const isPublic = this.reflector.getAllAndOverride<boolean>(
        IS_PUBLIC_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (isPublic) {
        return true;
      }
      const secretKey = this.configService.get('security.jwtSecret');
      const request = context.switchToHttp().getRequest();
      const token = request.headers.authorization.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException();
      }
      request.user = await this.jwtService.verifyAsync(token, {
        secret: secretKey,
      });
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException();
    }

    return true;
  }
}
