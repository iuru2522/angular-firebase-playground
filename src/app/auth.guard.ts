import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from './services/user.service';
import { UserRole } from './models/user-role.enum';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
    canActivate(): Observable<boolean> {
    return this.userService.getCurrentUser().pipe(
      map(user => {
        if (user) {
          return true;
        } else {
          this.router.navigate(['/']);
          return false;
        }
      })
    );
  }
}