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
        if (!user) {
          this.router.navigate(['/']);
          return false;
        }

        // Check if user is active
        if (!user.isActive) {
          this.router.navigate(['/account-deactivated']);
          return false;
        }

        return true;
      })
    );
  }
}