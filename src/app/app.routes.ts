import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { SigninComponent } from './signin/signin.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { AdminUsersComponent } from './admin/admin-users/admin-users.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { RequireAuthComponent } from './require-auth/require-auth.component';
import { OfflineFallbackComponent } from './offline-fallback/offline-fallback.component';
import { FileBugComponent } from './file-bug/file-bug.component';
import { BugListComponent } from './bug-list/bug-list.component';
import { BugDetailsComponent } from './bug-details/bug-details.component';
import { AuthGuard } from './auth.guard';
import { RoleGuard } from './guards/role.guard';
import { UserRole } from './models';
import { AdminUsersTableComponent } from './admin/admin-users-table/admin-users-table.component';
import { TestCasesComponent } from './test-cases/test-cases.component';
import { TestCaseFormComponent } from './test-case-form/test-case-form.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'offline', component: OfflineFallbackComponent },
  { 
    path: 'dashboard', 
    component: UserDashboardComponent
  },
  {
    path: 'file-bug',
    component: FileBugComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'bug-list',
    component: BugListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'bug-details/:id',
    component: BugDetailsComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'admin/users', 
    component: AdminUsersComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.ADMIN] }
  },
  {
    path: 'admin/users-table',
    component: AdminUsersTableComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {roles: [UserRole.ADMIN]}
  },
  {
    path: 'test-cases',
    component: TestCasesComponent
  },
  {
    path: 'test-cases-form',
    component: TestCaseFormComponent
  },
  { 
    path: 'require-auth', 
    component: RequireAuthComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '' }
];