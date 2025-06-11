import { Directive, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth';

@Directive({
  selector: '[googleSso]',
  standalone: true,
})
export class GoogleSsoDirective {
  private readonly afAuth = inject(AngularFireAuth);
  private readonly platformId = inject(PLATFORM_ID);

  @HostListener('click')
  async onClick(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('[GoogleSsoDirective] Authentication is only supported in browser environment');
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      await this.afAuth.signInWithRedirect(provider);
    } catch (error) {
      console.error('[GoogleSsoDirective] Authentication failed:', error instanceof Error ? error.message : error);
      throw new Error('Failed to authenticate with Google');
    }
  }
}