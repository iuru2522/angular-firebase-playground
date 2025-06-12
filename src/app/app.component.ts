import { Component, OnInit, OnDestroy, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GoogleSsoDirective } from './google-sso.directive';

interface AuthError extends Error {
  code?: string;
}

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
  
  private readonly afAuth = inject(AngularFireAuth);
  private readonly platformId = inject(PLATFORM_ID);
  private authSubscription?: Subscription;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      await this.afAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      const result = await this.afAuth.getRedirectResult();
      
      if (result.user) {
        console.log('User signed in after redirect:', result.user);
        this.user.set(result.user);
      }
    } catch (error) {
      this.handleAuthError(error as AuthError, 'Error during auth initialization');
    }
  }
  
  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.authSubscription = this.afAuth.authState.subscribe({
      next: (user) => {
        this.user.set(user);
        console.log('Auth state changed:', user);
      },
      error: (error) => {
        this.handleAuthError(error as AuthError, 'Error in auth state subscription');
      }
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }
  
  async logout(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      await this.afAuth.signOut();
      console.log('User signed out successfully');
    } catch (error) {
      this.handleAuthError(error as AuthError, 'Sign out error');
    }
  }

  private handleAuthError(error: AuthError, context: string): void {
    console.error(`${context}:`, error);
    // Here you could add error handling logic like showing a toast message
    // or redirecting to an error page based on the error code
  }
}