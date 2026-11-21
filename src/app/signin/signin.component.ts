import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
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
  imports: [ReactiveFormsModule, RouterModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './signin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SigninComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly showPassword = signal(false);
  readonly toggleVisibility = (visible: boolean) => !visible;
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
    if (this.signinForm.invalid) {
      this.signinForm.markAllAsTouched();
      return;
    }
    if (!this.isSubmitting() && !this.successMessage()) {
      const { email, password } = this.signinForm.getRawValue();

      this.isSubmitting.set(true);
      this.error.set(null);
      this.successMessage.set(null);

      try {
        await firstValueFrom(
          this.authService.login(email, password)
        );

        this.successMessage.set('Sign in successful! Redirecting...');

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);

      } catch (error: unknown) {
        console.error('Sign in failed:', error);
        this.error.set(this.getErrorMessage(error));
      } finally {
        this.isSubmitting.set(false);
      }
    }
  }

  async onGoogleSignIn(): Promise<void> {
    if (this.isSubmitting() || this.successMessage()) return;
    try {
      this.isSubmitting.set(true);
      this.error.set(null);

      await this.authService.loginWithGoogle();
      this.router.navigate(['/']);

    } catch (error: unknown) {
      console.error('Google sign-in failed:', error);
      this.error.set(this.getErrorMessage(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private getErrorMessage(error: unknown): string {
    const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Email or password is incorrect. Check your details and try again.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return 'Sign in failed. Please try again.';
    }
  }
}