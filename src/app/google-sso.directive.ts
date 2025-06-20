import { Directive, HostListener } from '@angular/core';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

@Directive({
  selector: '[appGoogleSso]',
})
export class GoogleSsoDirective {
  @HostListener('click')
  onClick() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
      .then((result) => {
        console.log('User signed in:', result.user);
      })
      .catch((error) => {
        console.error('Error during sign-in:', error);
      });
  }
}