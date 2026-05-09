import { Component, OnInit, OnDestroy, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { FirebaseDiagnosticService } from './services/firebase-diagnostic.service';
import { OfflineFallbackComponent } from './offline-fallback/offline-fallback.component';
import { User as AppUser } from './models/user.interface';
import { UserService } from './services/user.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    OfflineFallbackComponent,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  readonly title = 'angular-firebase-playground';

  private readonly authService = inject(AuthService);
  private readonly diagnosticService = inject(FirebaseDiagnosticService);
  private readonly userService = inject(UserService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  private authSubscription?: Subscription;
  private navSubscription?: Subscription;

  readonly user = signal<AppUser | null>(null);
  readonly isAuthenticated = computed(() => !!this.user());
  readonly currentPath = signal(this.normalizeUrlPath(this.router.url));
  private readonly guestAuthPaths = new Set(['/', '/signin', '/register', '/forgot-password']);
  readonly isGuestAuthShell = computed(
    () => !this.isAuthenticated() && this.guestAuthPaths.has(this.currentPath())
  );
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly showOfflineFallback = signal<boolean>(false);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeAuthState();
      this.runDiagnostics();
      this.navSubscription = this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe(() => this.currentPath.set(this.normalizeUrlPath(this.router.url)));
    }
  }

  ngOnDestroy(): void {
    this.cleanupAuthSubscription();
    this.navSubscription?.unsubscribe();
    this.navSubscription = undefined;
  }

  async logout(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      this.isLoading.set(true);
      this.error.set(null);
      await this.authService.logout();
      this.user.set(null);
      this.router.navigate(['/']);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to logout');
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async login(): Promise<void> {
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

  private normalizeUrlPath(url: string): string {
    const path = url.split(/[?#]/)[0] ?? '';
    return path === '' ? '/' : path;
  }

  private initializeAuthState(): void {
    const timeoutId = setTimeout(() => {
      console.warn('Auth initialization taking too long, showing offline fallback...');
      this.showOfflineFallback.set(true);
    }, 15000);

    this.authSubscription = this.userService.getCurrentUser().subscribe({
      next: (user) => {
        clearTimeout(timeoutId);
        this.user.set(user);
        this.showOfflineFallback.set(false);

        if (user && !user.isActive) {
          this.router.navigate(['/account-deactivated']);
        }
      },
      error: (err: unknown) => {
        clearTimeout(timeoutId);
        console.error('Auth initialization error:', err);
        this.error.set(err instanceof Error ? err.message : 'Authentication error');
        this.showOfflineFallback.set(true);
      }
    });
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
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await this.diagnosticService.diagnoseFirebase();
      await this.diagnosticService.checkFirestoreRules();
    } catch (error) {
      console.error('Diagnostic failed:', error);
    }
  }
}
