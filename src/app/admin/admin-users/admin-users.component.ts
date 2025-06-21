import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '../../services/user.service';
import { User, UserRole, USER_ROLE_LABELS } from '../../models';

interface AdminAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AdminUsersComponent {
  private readonly userService = inject(UserService);
  
  // Convert Observable to signal for better reactivity
  readonly currentUser = toSignal(this.userService.getCurrentUser());
  readonly userRoles = Object.values(UserRole);
  
  // Action feedback signals
  readonly actionInProgress = signal<string | null>(null);
  readonly actionMessage = signal<string | null>(null);
  
  // Computed properties for better performance
  readonly isCurrentUserAdmin = computed(() => 
    this.currentUser()?.role === UserRole.ADMIN
  );
  
  readonly adminActions = computed<AdminAction[]>(() => [
    {
      id: 'user-list',
      title: '📋 View All Users',
      description: 'See all registered users',
      icon: '📋',
      disabled: !this.isCurrentUserAdmin()
    },
    {
      id: 'manage-roles',
      title: '🔑 Manage Roles',
      description: 'Assign and modify user roles',
      icon: '🔑',
      disabled: !this.isCurrentUserAdmin()
    },
    {
      id: 'system-stats',
      title: '📊 System Stats',
      description: 'View usage statistics',
      icon: '📊',
      disabled: !this.isCurrentUserAdmin()
    },
    {
      id: 'export-data',
      title: '💾 Export Data',
      description: 'Download user data',
      icon: '💾',
      disabled: !this.isCurrentUserAdmin()
    }
  ]);

  getRoleLabel(role: UserRole): string {
    return USER_ROLE_LABELS[role] || role;
  }
  getRoleDescription(role: UserRole): string {
    const descriptions = {
      [UserRole.ADMIN]: 'Full system access and user management',
      [UserRole.PROJECT_MANAGER]: 'Manage projects and assign tasks',
      [UserRole.DEVELOPER]: 'Work on assigned bugs and features',
      [UserRole.QA_TESTER]: 'Test and verify bug fixes',
      [UserRole.REPORTER]: 'Report bugs and issues'
    };
    return descriptions[role] || '';
  }

  async performAction(actionId: string): Promise<void> {
    if (this.actionInProgress()) return;
    
    this.actionInProgress.set(actionId);
    this.actionMessage.set(null);
    
    try {
      await this.executeAction(actionId);
      this.actionMessage.set(`Action "${actionId}" completed successfully`);
    } catch (error) {
      this.actionMessage.set(`Failed to execute "${actionId}": ${error}`);
    } finally {
      this.actionInProgress.set(null);
      // Clear message after 3 seconds
      setTimeout(() => this.actionMessage.set(null), 3000);
    }
  }

  private async executeAction(actionId: string): Promise<void> {
    // Simulate async operations
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    switch (actionId) {
      case 'user-list':
        console.log('Fetching user list...');
        break;
      case 'manage-roles':
        console.log('Opening role management interface...');
        break;
      case 'system-stats':
        console.log('Loading system statistics...');
        break;
      case 'export-data':
        console.log('Exporting user data...');
        break;
      default:
        throw new Error(`Unknown action: ${actionId}`);
    }
  }

  // Legacy methods for backward compatibility (to be removed)
  showUserList(): void {
    this.performAction('user-list');
  }

  manageRoles(): void {
    this.performAction('manage-roles');
  }

  viewSystemStats(): void {
    this.performAction('system-stats');
  }

  exportData(): void {
    this.performAction('export-data');
  }
}
