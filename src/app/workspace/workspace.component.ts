import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { User, UserRole, USER_ROLE_DESCRIPTIONS, USER_ROLE_LABELS } from '../models';

interface WorkspaceAction {
  readonly label: string;
  readonly route: string;
}

const BUG_LIST: WorkspaceAction = { label: 'Bug list', route: '/bug-list' };
const FILE_BUG: WorkspaceAction = { label: 'File a bug', route: '/file-bug' };

const ROLE_ACTIONS: Record<UserRole, readonly WorkspaceAction[]> = {
  [UserRole.ADMIN]: [{ label: 'Users & roles', route: '/admin/users' }, BUG_LIST],
  [UserRole.PROJECT_MANAGER]: [BUG_LIST],
  [UserRole.DEVELOPER]: [BUG_LIST],
  [UserRole.QA_TESTER]: [{ label: 'Test cases', route: '/test-cases' }, FILE_BUG, BUG_LIST],
  [UserRole.REPORTER]: [{ ...FILE_BUG, label: 'New report' }, BUG_LIST],
};

const ROLE_PERMISSIONS: Record<UserRole, readonly string[]> = {
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

@Component({
  selector: 'app-workspace',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceComponent {
  readonly user = input.required<User>();
  readonly protectedDashboard = input(false);

  protected readonly name = computed(() => this.user().displayName?.trim() || this.user().email);
  protected readonly roleLabel = computed(() => USER_ROLE_LABELS[this.user().role]);
  protected readonly description = computed(() => USER_ROLE_DESCRIPTIONS[this.user().role]);
  protected readonly actions = computed(() => ROLE_ACTIONS[this.user().role] ?? []);
  protected readonly permissions = computed(() => ROLE_PERMISSIONS[this.user().role] ?? []);
}
