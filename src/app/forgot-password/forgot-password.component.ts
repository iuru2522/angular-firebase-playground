import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

interface ForgotPasswordForm {
  email: FormControl<string>;
}
@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './forgot-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent {

  private readonly authService = inject(AuthService);

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
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }
    if (!this.isSubmitting()) {
      const { email } = this.forgotPasswordForm.getRawValue();

      this.isSubmitting.set(true);
      this.error.set(null);
      this.successMessage.set(null);

      try {
        await firstValueFrom(this.authService.sendPasswordResetEmail(email));
        this.confirmReset();
      } catch (error: unknown) {
        const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
        if (code === 'auth/user-not-found') {
          this.confirmReset();
        } else {
          this.error.set(this.getErrorMessage(code));
        }
      } finally {
        this.isSubmitting.set(false);
      }
    }
  }

  useDifferentEmail(): void {
    this.successMessage.set(null);
    this.forgotPasswordForm.reset();
  }

  private confirmReset(): void {
    this.successMessage.set('If an account exists for that email, we’ll send a link to reset your password.');
  }

  private getErrorMessage(code: unknown): string {
    switch (code) {
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
        return 'Could not send a reset link. Please try again.';
    }
  }

}