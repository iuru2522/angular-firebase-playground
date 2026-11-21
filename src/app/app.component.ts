import { Component, OnInit, OnDestroy, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { IsActiveMatchOptions, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { FirebaseDiagnosticService } from './services/firebase-diagnostic.service';
import { ThemeService } from './services/theme.service';
import { OfflineFallbackComponent } from './offline-fallback/offline-fallback.component';
import { User as AppUser } from './models/user.interface';
import { UserService } from './services/user.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

const homeLink = { path: '/', icon: 'home', label: 'Home' };
const createIssueLink = { path: '/file-bug', icon: 'add', label: 'Create Issue' };
const settingsLink = { path: '/settings', icon: 'settings', label: 'Settings' };

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    OfflineFallbackComponent,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  readonly title = 'angular-firebase-playground';

  private readonly authService = inject(AuthService);
  private readonly diagnosticService = inject(FirebaseDiagnosticService);
  private readonly userService = inject(UserService);
  readonly themeService = inject(ThemeService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  private authSubscription?: Subscription;

  readonly user = signal<AppUser | null>(null);
  readonly isAuthenticated = computed(() => !!this.user());
  readonly accountName = computed(() => {
    const user = this.user();
    return user?.displayName?.trim() || user?.email || 'Account';
  });
  readonly accountInitials = computed(() => {
    const initials = this.accountName().split(/[\s@]+/).slice(0, 2).map((word) => word[0] ?? '');
    return initials.join('').toUpperCase();
  });
  readonly navigationLayouts = [
    { className: 'app-navigation--rail', items: [createIssueLink, homeLink, settingsLink] },
    { className: 'app-navigation--bottom', items: [homeLink, createIssueLink, settingsLink] },
  ];
  readonly navigationMatch: IsActiveMatchOptions = {
    paths: 'exact',
    queryParams: 'ignored',
    matrixParams: 'ignored',
    fragment: 'ignored',
  };
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
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
    if (!isPlatformBrowser(this.platformId) || this.isLoading()) return;
    try {
      this.isLoading.set(true);
      this.error.set(null);
      await this.authService.logout();
      this.user.set(null);
      await this.router.navigate(['/']);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to logout');
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

  toggleTheme(): void {
    this.themeService.toggleLightDark();
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
