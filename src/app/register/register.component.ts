import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';
interface RegisterForm {
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  displayName: FormControl<string>;
}
@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  registerForm = new FormGroup<RegisterForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)]
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    displayName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    })
  }, { validators: this.passwordMatchValidator });

  async onSubmit(): Promise<void> {
    if (this.registerForm.valid && !this.isSubmitting()) {
      const { email, password, displayName } = this.registerForm.getRawValue();

      this.isSubmitting.set(true);
      this.error.set(null);
      this.successMessage.set(null);

      try {
        const userCredential = await firstValueFrom(this.authService.registerWithEmail(email, password));
        this.successMessage.set('Registration successful! Redirecting...');

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);

      } catch (error: any) {
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

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  private getErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please use a different email or try signing in.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'Email/password registration is not enabled. Please contact support.';
      default:
        return error.message || 'Registration failed. Please try again.';
    }
  }


}
