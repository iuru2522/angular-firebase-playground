import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';

export const authGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);
  return userService.getCurrentUser().pipe(
    map((user) => {
      if (!user) {
        return router.parseUrl('/');
      }
      if (!user.isActive) {
        return router.parseUrl('/account-deactivated');
      }
      return true;
    })
  );
};

export const guestOnlyGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // The first Firebase auth event reflects the restored session.
  return auth.authState$.pipe(
    take(1),
    map((user) => user ? router.createUrlTree(['/']) : true),
  );
};
