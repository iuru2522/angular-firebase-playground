import { Component, OnInit, inject, runInInjectionContext, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, authState, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class LoginComponent implements OnInit {
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);

  ngOnInit() {
    // Redirect if user is already authenticated
    runInInjectionContext(this.injector, () => {
      const auth = inject(Auth);
      authState(auth).subscribe(user => {
        if (user) {
          this.router.navigate(['/dashboard']);
        }
      });
    });
  }

  async _loginWithGoogle() {
    return runInInjectionContext(this.injector, async () => {
      const auth = inject(Auth);
      try {
        const provider = new GoogleAuthProvider();
        const googleResponse = await signInWithPopup(auth, provider);
        // Successfully logged in
        console.log(googleResponse);
        // Navigate to dashboard after successful login
        this.router.navigate(['/dashboard']);
      } catch (err) {
        // Login error
        console.log(err);
      }
    });
  }
}
