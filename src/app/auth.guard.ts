import { Injectable, inject, runInInjectionContext, Injector } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, of, timeout, catchError } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  
  canActivate(): Observable<boolean> {
    return runInInjectionContext(this.injector, () => {
      const auth = inject(Auth);
      return authState(auth).pipe(
        take(1),
        timeout(10000), // 10 second timeout
        map(user => {
          if (user) {
            return true;
          } else {
            this.router.navigate(['/signin']);
            return false;
          }
        }),
        catchError(error => {
          console.error('AuthGuard timeout or error:', error);
          // On timeout or error, redirect to signin
          this.router.navigate(['/signin']);
          return of(false);
        })
      );
    });
  }
}