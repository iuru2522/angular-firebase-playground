import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '../../services/user.service';
import { User, UserRole, USER_ROLE_LABELS } from '../../models';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css'],
  standalone: false
})
export class AdminUsersComponent implements OnInit {
  currentUser$: Observable<User | null>;
  userRoles = Object.values(UserRole);

  constructor(private userService: UserService) {
    this.currentUser$ = this.userService.getCurrentUser();
  }

  ngOnInit(): void {}

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

  showUserList(): void {
    alert('This would show a list of all users in the system');
  }

  manageRoles(): void {
    alert('This would open a role management interface');
  }

  viewSystemStats(): void {
    alert('This would show system usage statistics');
  }

  exportData(): void {
    alert('This would export user data to CSV/Excel');
  }
}
