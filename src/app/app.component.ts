import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  readonly title = 'angular-firebase-playground';
  private readonly authService = inject(AuthService);
  private authSubscription?: Subscription;

  // Expose auth state signals from the service
  readonly user = this.authService.user;
  readonly isAuthenticated = this.authService.isAuthenticated;

  ngOnInit(): void {
    this.authSubscription = this.authService.getAuthState().subscribe();
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  async logout(): Promise<void> {
    await this.authService.logout();
  }
}