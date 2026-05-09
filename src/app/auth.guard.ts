import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
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