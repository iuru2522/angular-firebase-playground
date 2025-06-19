import { Component, OnInit, OnDestroy, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { FirebaseDiagnosticService } from './services/firebase-diagnostic.service';
import { OfflineFallbackComponent } from './offline-fallback/offline-fallback.component';

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
  private authSubscription?: Subscription;
  readonly user = this.authService.user;
  readonly isAuthenticated = this.authService.isAuthenticated;
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
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to logout');
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  private initializeAuthState(): void {
    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      console.warn('Auth initialization taking too long, showing offline fallback...');
      this.showOfflineFallback.set(true);
    }, 15000); // 15 second timeout

    this.authSubscription = this.authService.getAuthState().subscribe({
      next: () => {
        clearTimeout(timeoutId);
        this.firebaseReady.set(true);
        this.showOfflineFallback.set(false);
      },
      error: (err) => {
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
    // Only run diagnostics in browser context
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Run diagnostics after a short delay to ensure Firebase is initialized
    try {
      // Wait for Firebase to be ready
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await this.diagnosticService.diagnoseFirebase();
      await this.diagnosticService.checkFirestoreRules();
    } catch (error) {
      console.error('Diagnostic failed:', error);
    }
  }
}