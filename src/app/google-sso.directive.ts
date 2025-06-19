import { Directive, HostListener, inject, PLATFORM_ID, runInInjectionContext, Injector } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Auth, signInWithRedirect, GoogleAuthProvider } from '@angular/fire/auth';

@Directive({
  selector: '[googleSso]',
  standalone: true,
})
export class GoogleSsoDirective {
  private readonly injector = inject(Injector);
  private readonly platformId = inject(PLATFORM_ID);

  @HostListener('click')
  async onClick(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('[GoogleSsoDirective] Authentication is only supported in browser environment');
      return;
    }

    return runInInjectionContext(this.injector, async () => {
      const auth = inject(Auth);
      try {
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
      } catch (error) {
        console.error('[GoogleSsoDirective] Authentication failed:', error instanceof Error ? error.message : error);
        throw new Error('Failed to authenticate with Google');
      }
    });
  }
}