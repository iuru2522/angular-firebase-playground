import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, timeout, catchError } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { UserRole } from '../models';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredRoles = route.data?.['roles'] as UserRole[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return of(true);
    }

    return this.userService.hasAnyRole(requiredRoles).pipe(
      take(1),
      timeout(10000), // 10 second timeout
      map(hasRole => {
        if (hasRole) {
          return true;
        } else {
          this.router.navigate(['/unauthorized']);
          return false;
        }
      }),
      catchError(error => {
        console.error('RoleGuard timeout or error:', error);
        // On timeout or error, redirect to unauthorized
        this.router.navigate(['/unauthorized']);
        return of(false);
      })
    );
  }
} 