import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    const role = await this.userService.retreiveUserRole(request.user.userId);
    const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getClass(),
      context.getHandler(),
    ]);
    console.log('authorization Guard the reuired roles are: ', requiredRoles);

    const userRole = role;
    console.log(requiredRoles.length);
    
    for (let i = 0; i < requiredRoles.length; i++) {
      console.log('aaa', requiredRoles[i]);

      if (requiredRoles[i] === userRole) {
        console.log(true);
        
        return true;
      }
        
      
    }
    return false;
  }
}
