import { MatButtonModule } from '@angular/material/button';
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-account-deactivated',
  templateUrl: './account-deactivated.component.html',
  imports: [CommonModule, RouterModule, MatButtonModule]
})
export class AccountDeactivatedComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);

  async logout(): Promise<void> {
    if (this.isSubmitting()) return;
    this.isSubmitting.set(true);
    this.error.set(null);
    try {
      await this.authService.logout();
      await this.router.navigate(['/signin']);
    } catch {
      this.error.set('Could not sign out. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
