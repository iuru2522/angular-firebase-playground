import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '../services/user.service';
import { User, UserRole, USER_ROLE_LABELS, USER_ROLE_DESCRIPTIONS } from '../models';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule]
})
export class LandingComponent {
  private readonly userService = inject(UserService);
  readonly user = toSignal(this.userService.getCurrentUser());
  readonly isAdmin = toSignal(this.userService.hasRole(UserRole.ADMIN));
  readonly isProjectManager = toSignal(this.userService.hasRole(UserRole.PROJECT_MANAGER));
  readonly isDeveloper = toSignal(this.userService.hasRole(UserRole.DEVELOPER));
  readonly isQATester = toSignal(this.userService.hasRole(UserRole.QA_TESTER));
  readonly isReporter = toSignal(this.userService.hasRole(UserRole.REPORTER));

  getRoleLabel(role: UserRole): string {
    return USER_ROLE_LABELS[role] || role;
  }

  getRoleDescription(role: UserRole): string {
    return USER_ROLE_DESCRIPTIONS[role] || '';
  }
}