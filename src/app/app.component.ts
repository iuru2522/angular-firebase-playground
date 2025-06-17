import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
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
  readonly user = this.authService.user;
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.initializeAuthState();
  }

  ngOnDestroy(): void {
    this.cleanupAuthSubscription();
  }

  async logout(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);
      await this.authService.logout();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to logout');
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  private initializeAuthState(): void {
    this.authSubscription = this.authService.getAuthState().subscribe({
      error: (err) => {
        this.error.set(err instanceof Error ? err.message : 'Authentication error');
      }
    });
  }

  private cleanupAuthSubscription(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
      this.authSubscription = undefined;
    }
  }
}