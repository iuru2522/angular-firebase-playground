import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

interface SignInForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-signin',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SigninComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  signinForm = new FormGroup<SignInForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)]
    })
  });

  async onSubmit(): Promise<void> {
    if (this.signinForm.valid && !this.isSubmitting()) {
      const { email, password } = this.signinForm.getRawValue();

      this.isSubmitting.set(true);
      this.error.set(null);
      this.successMessage.set(null);

      try {
        const userCredential = await firstValueFrom(
          this.authService.login(email, password)
        );

        this.successMessage.set('Sign in successful! Redirecting...');

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);

      } catch (error: any) {
        console.error('Sign in failed:', error);
        this.error.set(this.getErrorMessage(error));
      } finally {
        this.isSubmitting.set(false);
      }
    }
  }

  async onGoogleSignIn(): Promise<void> {
    try {
      this.isSubmitting.set(true);
      this.error.set(null);

      await this.authService.loginWithGoogle();
      this.router.navigate(['/dashboard']);

    } catch (error: any) {
      console.error('Google sign-in failed:', error);
      this.error.set(this.getErrorMessage(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private getErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return error.message || 'Sign in failed. Please try again.';
    }
  }
}