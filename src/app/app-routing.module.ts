import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { SigninComponent } from './signin/signin.component';
import { RequireAuthComponent } from './require-auth/require-auth.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'signin', component: SigninComponent },
  { 
    path: 'require-auth', 
    component: RequireAuthComponent,
    canActivate: [AuthGuard]  // Protect this route
  },
  { path: '**', redirectTo: '' }  // Redirect any unmatched routes
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }