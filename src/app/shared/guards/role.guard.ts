import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  Router, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

/**
 * Guard to protect routes based on user role
 * Usage in routes: canActivate: [RoleGuard], data: { roles: [UserRole.SELLER, UserRole.ADMIN] }
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    const requiredRoles: UserRole[] = route.data['roles'] || [];

    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          // User not authenticated
          sessionStorage.setItem('redirectUrl', state.url);
          return this.router.createUrlTree(['/login']);
        }

        if (requiredRoles.length === 0 || requiredRoles.includes(user.activeRoleId)) {
          return true;
        }

        // User doesn't have required role
        return this.router.createUrlTree(['/unauthorized']);
      })
    );
  }
}
