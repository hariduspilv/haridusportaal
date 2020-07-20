import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserService } from './userService';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.userService.isLoggedIn) {
      this.router.navigate([`/auth`], {
        queryParams: { redirect: decodeURIComponent(state.url) },
      });
    }
    return this.userService.isLoggedIn;
  }
}
