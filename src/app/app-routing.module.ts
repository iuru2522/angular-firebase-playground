import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { SigninComponent } from './signin/signin.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { AdminUsersComponent } from './admin/admin-users/admin-users.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { RequireAuthComponent } from './require-auth/require-auth.component';
import { OfflineFallbackComponent } from './offline-fallback/offline-fallback.component';
import { AuthGuard } from './auth.guard';
import { RoleGuard } from './guards/role.guard';
import { UserRole } from './models';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'offline', component: OfflineFallbackComponent },  { 
    path: 'dashboard', 
    component: UserDashboardComponent
  },
  { 
    path: 'admin/users', 
    component: AdminUsersComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.ADMIN] }
  },
  { 
    path: 'require-auth', 
    component: RequireAuthComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '' }
];