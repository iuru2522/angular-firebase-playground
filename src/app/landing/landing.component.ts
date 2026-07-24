import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
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

  readonly dayOfWeek = computed(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  });

  readonly taskCount = computed(() => {
    const role = this.user()?.role;
    if (!role) return 0;

    const taskCounts: Record<UserRole, number> = {
      [UserRole.ADMIN]: 12,
      [UserRole.PROJECT_MANAGER]: 8,
      [UserRole.DEVELOPER]: 15,
      [UserRole.QA_TESTER]: 6,
      [UserRole.REPORTER]: 3
    };
    return taskCounts[role] || 0;
  });

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

  getRoleInfoDescription(role: UserRole): string {
    const descriptions: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'You have full system access and can manage all users and system settings.',
      [UserRole.PROJECT_MANAGER]: 'You can manage projects, assign tasks, and oversee team progress.',
      [UserRole.DEVELOPER]: 'You can work on assigned tasks, participate in code reviews, and contribute to development.',
      [UserRole.QA_TESTER]: 'You can test features, verify bug fixes, and ensure quality standards.',
      [UserRole.REPORTER]: 'You can report bugs and track the status of your reported issues.'
    };
    return descriptions[role] || '';
  }

  getRolePermissions(role: UserRole): string[] {
    const permissions: Record<UserRole, string[]> = {
      [UserRole.ADMIN]: [
        'Manage all users and roles',
        'Access system settings',
        'View all reports and analytics',
        'Export system data',
        'Manage projects and tasks'
      ],
      [UserRole.PROJECT_MANAGER]: [
        'Create and manage projects',
        'Assign tasks to team members',
        'View project reports',
        'Manage project timelines',
        'Access team performance metrics'
      ],
      [UserRole.DEVELOPER]: [
        'View assigned tasks',
        'Participate in code reviews',
        'Access development tools',
        'Submit code changes',
        'Report technical issues'
      ],
      [UserRole.QA_TESTER]: [
        'Execute test cases',
        'Verify bug fixes',
        'Create test reports',
        'Access testing environments',
        'Report bugs and issues'
      ],
      [UserRole.REPORTER]: [
        'Report bugs and issues',
        'View own reported issues',
        'Add comments to reports',
        'Track issue status',
        'Access knowledge base'
      ]
    };
    return permissions[role] || [];
  }
}
