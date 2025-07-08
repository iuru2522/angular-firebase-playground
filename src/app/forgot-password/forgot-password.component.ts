import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

interface ForgotPasswordForm {
  email: FormControl<string>;
}
@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  forgotPasswordForm = new FormGroup<ForgotPasswordForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    })
  })

  async onSubmit(): Promise<void> {
    if (this.forgotPasswordForm.valid && !this.isSubmitting()) {
      const { email } = this.forgotPasswordForm.getRawValue();

      this.isSubmitting.set(true);
      this.error.set(null);
      this.successMessage.set(null);

      try {
        await firstValueFrom(this.authService.sendPasswordResetEmail(email));
        this.successMessage.set('Password reset email sent! Check your inbox and spam folder.');
        this.forgotPasswordForm.reset();
      } catch (error: any) {
        this.error.set(this.getErrorMessage(error));
      } finally {
        this.isSubmitting.set(false);
      }
    }
  }

  private getErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many requests. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/configuration-not-found':
        return 'Email configuration error. Please contact support.';
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized. Please contact support.';
      default:
        return error.message || 'Failed to send reset email. Please try again. If the problem persists, check your spam folder or contact support.';
    }
  }

}