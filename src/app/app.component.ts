import { Component, OnInit, OnDestroy, inject, signal, PLATFORM_ID, Injector, runInInjectionContext } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { FirebaseDiagnosticService } from './services/firebase-diagnostic.service';
import { OfflineFallbackComponent } from './offline-fallback/offline-fallback.component';
import { effect, Signal, computed } from '@angular/core';
import { User as AppUser } from './models/user.interface';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    OfflineFallbackComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  readonly title = 'angular-firebase-playground';
  private readonly authService = inject(AuthService);
  private readonly diagnosticService = inject(FirebaseDiagnosticService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private authSubscription?: Subscription;
  readonly user = signal<AppUser | null>(null);
  readonly isAuthenticated = computed(() => !!this.user());
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly firebaseReady = signal<boolean>(false);
  readonly showOfflineFallback = signal<boolean>(false);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeAuthState();
      this.runDiagnostics();
    }
  }

  ngOnDestroy(): void {
    this.cleanupAuthSubscription();
  }
  async logout(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      this.isLoading.set(true);
      this.error.set(null);
      await this.authService.logout();
      this.user.set(null);
      // Redirect to home after logout
      this.router.navigate(['/']);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to logout');
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }  async login() {
    try {
      this.isLoading.set(true);
      this.error.set(null);
      await this.authService.loginWithGoogle();
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Login failed');
    } finally {
      this.isLoading.set(false);
    }
  }

  signUp(): void {
    this.router.navigate(['/register']);
  }

  signIn(): void {
    this.router.navigate(['/signin']);
  }

  private initializeAuthState(): void {
    const timeoutId = setTimeout(() => {
      console.warn('Auth initialization taking too long, showing offline fallback...');
      this.showOfflineFallback.set(true);
    }, 15000);

    this.authSubscription = runInInjectionContext(this.injector, () =>
      inject(UserService).getCurrentUser().subscribe({
        next: (user) => {
          clearTimeout(timeoutId);
          this.user.set(user);
          this.firebaseReady.set(true);
          this.showOfflineFallback.set(false);
          
          // Check if user is deactivated and redirect
          if (user && !user.isActive) {
            this.router.navigate(['/account-deactivated']);
          }
        },
        error: (err: any) => {
          clearTimeout(timeoutId);
          console.error('Auth initialization error:', err);
          this.error.set(err instanceof Error ? err.message : 'Authentication error');
          this.showOfflineFallback.set(true);
        }
      })
    );
  }

  private cleanupAuthSubscription(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
      this.authSubscription = undefined;
    }
  }

  private async runDiagnostics(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await this.diagnosticService.diagnoseFirebase();
      await this.diagnosticService.checkFirestoreRules();
    } catch (error) {
      console.error('Diagnostic failed:', error);
    }
  }
}