import { Injectable, inject, signal } from '@angular/core';
import { Auth, authState, signOut, setPersistence, browserLocalPersistence, getRedirectResult } from '@angular/fire/auth';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User as FirebaseUser } from 'firebase/auth';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthError, AuthErrorContext } from '../models/auth.types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly platformId = inject(PLATFORM_ID);

  readonly user = signal<FirebaseUser | null>(null);
  readonly isAuthenticated = signal<boolean>(false);
  private initialized = false;

  constructor() {
    // Defer initialization to avoid timing issues
    setTimeout(() => {
      this.initializeAuth();
    }, 0);
  }

  private async initializeAuth(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this.initialized) return;

    try {
      await setPersistence(this.auth, browserLocalPersistence);
      const result = await getRedirectResult(this.auth);
      
      if (result?.user) {
        this.handleSuccessfulAuth(result.user);
      }
      this.initialized = true;
    } catch (error) {
      this.handleAuthError(error as AuthError, 'initialization');
    }
  }

  getAuthState(): Observable<FirebaseUser | null> {
    return authState(this.auth).pipe(
      tap(user => this.handleAuthStateChange(user))
    );
  }

  async logout(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      await signOut(this.auth);
      this.handleSuccessfulLogout();
    } catch (error) {
      this.handleAuthError(error as AuthError, 'sign_out');
    }
  }

  private handleSuccessfulAuth(user: FirebaseUser): void {
    this.user.set(user);
    this.isAuthenticated.set(true);
    console.log('User authenticated successfully:', user.email);
  }

  private handleSuccessfulLogout(): void {
    this.user.set(null);
    this.isAuthenticated.set(false);
    console.log('User signed out successfully');
  }

  private handleAuthStateChange(user: FirebaseUser | null): void {
    this.user.set(user);
    this.isAuthenticated.set(!!user);
    console.log('Auth state changed:', user?.email ?? 'No user');
  }

  private handleAuthError(error: AuthError, context: AuthErrorContext): void {
    const errorMessages: Record<AuthErrorContext, string> = {
      initialization: 'Failed to initialize authentication',
      state_change: 'Error occurred while monitoring authentication state',
      sign_out: 'Failed to sign out'
    };

    console.error(`${errorMessages[context]}:`, error);
  }
} 