import { routes } from './app.routes';
import { authGuard } from './auth.guard';

export const clientAuthPaths = routes.flatMap(({ path, canActivate }) =>
  path && canActivate?.includes(authGuard) ? [path] : [],
);
