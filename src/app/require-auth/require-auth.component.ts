import { Component, inject, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-require-auth',
  templateUrl: './require-auth.component.html',
  styleUrl: './require-auth.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class RequireAuthComponent {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly user = toSignal(this.userService.getCurrentUser());

  constructor() {
    effect(() => {
      const currentUser = this.user();
      if (currentUser === null) {
        this.router.navigate(['/signin']);
      }
    });
  }
}
