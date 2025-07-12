import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../services/auth.service';
import { User, UserRole, USER_ROLE_LABELS } from '../models';
import { UserService } from '../services/user.service';
import { LoginPlaceholderComponent } from '../login-placeholder/login-placeholder.component';

interface ActivityItem {
  icon: string;
  text: string;
  time: string;
}

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, LoginPlaceholderComponent]
})
export class UserDashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);

  // Convert observables to signals
  readonly user = toSignal(this.userService.getCurrentUser());
  readonly isAuthenticated = computed(() => !!this.user());
  
  // Computed properties for better performance
  readonly currentUserRole = computed(() => this.user()?.role);
  readonly dayOfWeek = computed(() => this.getDayOfWeek());
  readonly taskCount = computed(() => this.getTaskCount(this.currentUserRole()));
  readonly recentActivities = computed(() => this.getRecentActivities(this.currentUserRole()));
  readonly rolePermissions = computed(() => this.getRolePermissions(this.currentUserRole()));

  constructor() {
    // Subscribe to auth state to ensure currentUser signal is updated
    this.authService.authState$.subscribe();
  }

  getRoleLabel(role: UserRole): string {
    return USER_ROLE_LABELS[role] || role;
  }

  getRoleDescription(role: UserRole): string {
    const descriptions = {
      [UserRole.ADMIN]: 'You have full system access and can manage all users and system settings.',
      [UserRole.PROJECT_MANAGER]: 'You can manage projects, assign tasks, and oversee team progress.',
      [UserRole.DEVELOPER]: 'You can work on assigned tasks, participate in code reviews, and contribute to development.',
      [UserRole.QA_TESTER]: 'You can test features, verify bug fixes, and ensure quality standards.',
      [UserRole.REPORTER]: 'You can report bugs and track the status of your reported issues.'
    };
    return descriptions[role] || '';
  }

  private getDayOfWeek(): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }

  private getTaskCount(role: UserRole | undefined): number {
    if (!role) return 0;
    
    const taskCounts = {
      [UserRole.ADMIN]: 12,
      [UserRole.PROJECT_MANAGER]: 8,
      [UserRole.DEVELOPER]: 15,
      [UserRole.QA_TESTER]: 6,
      [UserRole.REPORTER]: 3
    };
    return taskCounts[role] || 0;
  }

  private getRecentActivities(role: UserRole | undefined): ActivityItem[] {
    if (!role) return [];
    
    const activities: Record<UserRole, ActivityItem[]> = {
      [UserRole.ADMIN]: [
        { icon: '👤', text: 'New user registered: john.doe@example.com', time: '2 hours ago' },
        { icon: '🔧', text: 'System maintenance completed', time: '1 day ago' },
        { icon: '📊', text: 'Generated monthly user report', time: '2 days ago' }
      ],
      [UserRole.PROJECT_MANAGER]: [
        { icon: '📋', text: 'Created new project: Mobile App v2.0', time: '1 hour ago' },
        { icon: '👥', text: 'Assigned 3 tasks to development team', time: '3 hours ago' },
        { icon: '✅', text: 'Approved feature specification', time: '1 day ago' }
      ],
      [UserRole.DEVELOPER]: [
        { icon: '🐛', text: 'Fixed bug in user authentication', time: '30 minutes ago' },
        { icon: '🔍', text: 'Code review completed for PR #123', time: '2 hours ago' },
        { icon: '⚡', text: 'Started work on task: API optimization', time: '4 hours ago' }
      ],
      [UserRole.QA_TESTER]: [
        { icon: '✅', text: 'Verified bug fix: Login issue resolved', time: '1 hour ago' },
        { icon: '🧪', text: 'Executed test suite for mobile app', time: '3 hours ago' },
        { icon: '📝', text: 'Updated test case documentation', time: '1 day ago' }
      ],
      [UserRole.REPORTER]: [
        { icon: '🐛', text: 'Reported new bug: Search not working', time: '2 hours ago' },
        { icon: '📄', text: 'Bug #456 was resolved', time: '1 day ago' },
        { icon: '💬', text: 'Added comment to bug report #789', time: '2 days ago' }
      ]
    };
    return activities[role] || [];
  }

  private getRolePermissions(role: UserRole | undefined): string[] {
    if (!role) return [];
    
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
