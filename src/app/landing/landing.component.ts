import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '../services/user.service';
import { UserRole, USER_ROLE_LABELS, USER_ROLE_DESCRIPTIONS } from '../models';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink]
})
export class LandingComponent {
  private readonly userService = inject(UserService);

  readonly user = toSignal(this.userService.getCurrentUser(), { initialValue: null });

  readonly isAdmin = toSignal(this.userService.hasRole(UserRole.ADMIN), {
    initialValue: false
  });
  readonly isProjectManager = toSignal(this.userService.hasRole(UserRole.PROJECT_MANAGER), {
    initialValue: false
  });
  readonly isDeveloper = toSignal(this.userService.hasRole(UserRole.DEVELOPER), {
    initialValue: false
  });
  readonly isQATester = toSignal(this.userService.hasRole(UserRole.QA_TESTER), {
    initialValue: false
  });
  readonly isReporter = toSignal(this.userService.hasRole(UserRole.REPORTER), {
    initialValue: false
  });

  getRoleLabel(role: UserRole): string {
    return USER_ROLE_LABELS[role] || role;
  }

  getRoleDescription(role: UserRole): string {
    return USER_ROLE_DESCRIPTIONS[role] || '';
  }
}