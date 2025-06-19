import { Directive, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Auth, signInWithRedirect, GoogleAuthProvider } from '@angular/fire/auth';

@Directive({
  selector: '[googleSso]',
  standalone: true,
})
export class GoogleSsoDirective {
  private readonly auth = inject(Auth);
  private readonly platformId = inject(PLATFORM_ID);

  @HostListener('click')
  async onClick(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('[GoogleSsoDirective] Authentication is only supported in browser environment');
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(this.auth, provider);
    } catch (error) {
      console.error('[GoogleSsoDirective] Authentication failed:', error instanceof Error ? error.message : error);
      throw new Error('Failed to authenticate with Google');
    }
  }
}