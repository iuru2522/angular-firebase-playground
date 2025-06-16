import { Injectable, inject, signal } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import firebase from 'firebase/compat/app';
import { Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthError, AuthErrorContext } from '../models/auth.types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly afAuth = inject(AngularFireAuth);
  private readonly platformId = inject(PLATFORM_ID);

  readonly user = signal<firebase.User | null>(null);
  readonly isAuthenticated = signal<boolean>(false);

  constructor() {
    this.initializeAuth();
  }

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

  getAuthState(): Observable<firebase.User | null> {
    return this.afAuth.authState.pipe(
      tap(user => this.handleAuthStateChange(user))
    );
  }

  async logout(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      await this.afAuth.signOut();
      this.handleSuccessfulLogout();
    } catch (error) {
      this.handleAuthError(error as AuthError, 'sign_out');
    }
  }

  private handleSuccessfulAuth(user: firebase.User): void {
    this.user.set(user);
    this.isAuthenticated.set(true);
    console.log('User authenticated successfully:', user.email);
  }

  private handleSuccessfulLogout(): void {
    this.user.set(null);
    this.isAuthenticated.set(false);
    console.log('User signed out successfully');
  }

  private handleAuthStateChange(user: firebase.User | null): void {
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