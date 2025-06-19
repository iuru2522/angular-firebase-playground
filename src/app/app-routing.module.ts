import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LandingComponent } from './landing/landing.component';
import { SigninComponent } from './signin/signin.component';
import { RequireAuthComponent } from './require-auth/require-auth.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { AdminUsersComponent } from './admin/admin-users/admin-users.component';
import { AuthGuard } from './auth.guard';
import { RoleGuard } from './guards/role.guard';
import { UserRole } from './models';
import { OfflineFallbackComponent } from './offline-fallback/offline-fallback.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'offline', component: OfflineFallbackComponent },
  { path: 'dashboard', component: UserDashboardComponent, canActivate: [AuthGuard] },
  { 
    path: 'admin', 
    children: [
      { path: 'users', component: AdminUsersComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: [UserRole.ADMIN] } },
      { path: 'reports', component: RequireAuthComponent }, 
    ]
  },
  

  { 
    path: 'projects', 
    component: RequireAuthComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'assign-tasks', 
    component: RequireAuthComponent, 
    canActivate: [AuthGuard] 
  },
  
  { 
    path: 'my-tasks', 
    component: RequireAuthComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.DEVELOPER, UserRole.QA_TESTER] }
  },
  { 
    path: 'code-review', 
    component: RequireAuthComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.DEVELOPER] }
  },
  
  { 
    path: 'test-cases', 
    component: RequireAuthComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.QA_TESTER] }
  },
  { 
    path: 'bug-verification', 
    component: RequireAuthComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.QA_TESTER] }
  },
  

  { 
    path: 'report-bug', 
    component: RequireAuthComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.REPORTER, UserRole.QA_TESTER, UserRole.DEVELOPER] }
  },
  { 
    path: 'my-reports', 
    component: RequireAuthComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.REPORTER] }
  },
  
  { path: '**', redirectTo: '' }  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }