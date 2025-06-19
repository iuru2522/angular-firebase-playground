import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';
import { User, UserRole, USER_ROLE_LABELS, USER_ROLE_DESCRIPTIONS } from '../models';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class LandingComponent implements OnInit {
  user$: Observable<User | null>;
  isAdmin$: Observable<boolean>;
  isProjectManager$: Observable<boolean>;
  isDeveloper$: Observable<boolean>;
  isQATester$: Observable<boolean>;
  isReporter$: Observable<boolean>;

  constructor(private userService: UserService) {
    this.user$ = this.userService.getCurrentUser();
    this.isAdmin$ = this.userService.hasRole(UserRole.ADMIN);
    this.isProjectManager$ = this.userService.hasRole(UserRole.PROJECT_MANAGER);
    this.isDeveloper$ = this.userService.hasRole(UserRole.DEVELOPER);
    this.isQATester$ = this.userService.hasRole(UserRole.QA_TESTER);
    this.isReporter$ = this.userService.hasRole(UserRole.REPORTER);
  }

  ngOnInit(): void {}

  getRoleLabel(role: UserRole): string {
    return USER_ROLE_LABELS[role] || role;
  }

  getRoleDescription(role: UserRole): string {
    return USER_ROLE_DESCRIPTIONS[role] || '';
  }
}