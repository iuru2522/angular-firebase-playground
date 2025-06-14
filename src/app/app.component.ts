import { Component, OnInit, OnDestroy, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GoogleSsoDirective } from './google-sso.directive';
import { AuthError, AuthErrorContext } from './models/auth.types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    GoogleSsoDirective
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  readonly title = 'angular-firebase-playground';
  readonly user = signal<firebase.User | null>(null);
  readonly isAuthenticated = signal<boolean>(false);
  
  private readonly afAuth = inject(AngularFireAuth);
  private readonly platformId = inject(PLATFORM_ID);
  private authSubscription?: Subscription;

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initializes Firebase authentication with local persistence
   * and handles redirect results from OAuth providers
   */
  private async initializeAuth(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      await this.afAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      const result = await this.afAuth.getRedirectResult();
      
      if (result.user) {
        this.handleSuccessfulAuth(result.user);
      }
    } catch (error) {
      this.handleAuthError(error as AuthError, 'initialization');
    }
  }
  
  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.authSubscription = this.afAuth.authState.subscribe({
      next: (user) => this.handleAuthStateChange(user),
      error: (error) => this.handleAuthError(error as AuthError, 'state_change')
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }
  
  /**
   * Signs out the current user from Firebase Auth
   */
  async logout(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      await this.afAuth.signOut();
      this.handleSuccessfulLogout();
    } catch (error) {
      this.handleAuthError(error as AuthError, 'sign_out');
    }
  }

  /**
   * Handles successful authentication by updating the user state
   */
  private handleSuccessfulAuth(user: firebase.User): void {
    this.user.set(user);
    this.isAuthenticated.set(true);
    console.log('User authenticated successfully:', user.email);
  }

  /**
   * Handles successful logout by clearing the user state
   */
  private handleSuccessfulLogout(): void {
    this.user.set(null);
    this.isAuthenticated.set(false);
    console.log('User signed out successfully');
  }

  /**
   * Handles authentication state changes
   */
  private handleAuthStateChange(user: firebase.User | null): void {
    this.user.set(user);
    this.isAuthenticated.set(!!user);
    console.log('Auth state changed:', user?.email ?? 'No user');
  }

  /**
   * Handles authentication errors with proper error context
   */
  private handleAuthError(error: AuthError, context: AuthErrorContext): void {
    const errorMessages: Record<AuthErrorContext, string> = {
      initialization: 'Failed to initialize authentication',
      state_change: 'Error occurred while monitoring authentication state',
      sign_out: 'Failed to sign out'
    };

    console.error(`${errorMessages[context]}:`, error);
    // TODO: Implement proper error handling (e.g., toast notifications)
    // This could be enhanced with a proper error handling service
  }
}