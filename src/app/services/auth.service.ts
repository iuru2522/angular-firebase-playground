import { inject, Injectable, PLATFORM_ID, Injector, runInInjectionContext, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { from, Observable, of } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut, setPersistence, getRedirectResult, browserLocalPersistence, onAuthStateChanged, User, UserCredential, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { FirebaseInitService } from './firebase-init.service';
import { AuthError, AuthErrorContext } from '../models/auth.types';

import { createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly firebase = inject(FirebaseInitService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);
  private initialized = false;


  currentUser = signal<User | null>(null);

  public readonly authState$ = new Observable<User | null>(subscriber => {
    if (!isPlatformBrowser(this.platformId)) {
      subscriber.next(null);
      subscriber.complete();
      return;
    }
    return onAuthStateChanged(this.firebase.auth, user => subscriber.next(user));
  }).pipe(
    tap(user => this.handleAuthStateChange(user))
  );
  constructor() {
    this.initializeAuth();
    this.authState$.subscribe();
  }

  private async initializeAuth(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this.initialized) return;
    try {
      await setPersistence(this.firebase.auth, browserLocalPersistence);
      const result = await getRedirectResult(this.firebase.auth);
      if (result?.user) this.handleSuccessfulAuth(result.user);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize authentication:', error);
    }
  }

  login(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.firebase.auth, email, password)).pipe(
      tap(result => this.handleSuccessfulAuth(result.user))
    );
  }

  logout(): Observable<void> {
    return from(firebaseSignOut(this.firebase.auth));
  }

  registerWithEmail(email: string, password: string): Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(this.firebase.auth, email, password)).pipe(
      tap(result => this.handleSuccessfulAuth(result.user))
    );
  }

  sendPasswordResetEmail(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.firebase.auth, email));
  }

  updateUserProfile(displayName: string, photoUrl?: string): Observable<void> {
    const user = this.firebase.auth.currentUser;

    if (!user) {
      throw new Error('No user is currently signed in');
    }

    const profileData: any = { displayName };
    if (photoUrl) {
      profileData.photoURL = photoUrl;
    }

    return from(updateProfile(user, profileData));

  }

  async loginWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(this.firebase.auth, provider);
      this.handleSuccessfulAuth(result.user);
      return result.user;
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      throw error;
    }
  }
  private handleSuccessfulAuth(user: User): void {
    this.currentUser.set(user);
  }
  private handleAuthStateChange(user: User | null): void {
    this.currentUser.set(user);
  }
}