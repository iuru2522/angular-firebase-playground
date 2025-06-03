import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { UserRole } from '../models';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredRoles = route.data['roles'] as UserRole[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return new Observable(observer => {
        observer.next(true);
        observer.complete();
      });
    }

    return this.userService.hasAnyRole(requiredRoles).pipe(
      tap(hasRole => {
        if (!hasRole) {
          this.router.navigate(['/unauthorized']);
        }
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.userService.hasRole(UserRole.ADMIN).pipe(
      tap(isAdmin => {
        if (!isAdmin) {
          this.router.navigate(['/unauthorized']);
        }
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class ProjectManagerGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.userService.hasAnyRole([UserRole.ADMIN, UserRole.PROJECT_MANAGER]).pipe(
      tap(hasRole => {
        if (!hasRole) {
          this.router.navigate(['/unauthorized']);
        }
      })
    );
  }
}
