import { Component, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '../../services/user.service';
import { User, UserRole, USER_ROLE_LABELS } from '../../models';


@Component({
    selector: 'app-admin-users-table',
    templateUrl: './admin-users-table.component.html',
    styleUrl: './admin-users-table.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, RouterModule, ReactiveFormsModule]
})

export class AdminUsersTableComponent {
    private readonly userService = inject(UserService);

    private loadingUserIds = signal<Set<string>>(new Set());

    readonly users = toSignal(this.userService.getAllUsers(), { initialValue: [] });
    readonly currentUser = toSignal(this.userService.getCurrentUser());

    readonly isLoading = signal(false);
    readonly error = signal<string | null>(null);
    readonly successMessage = signal<string | null>(null);

    readonly userRoles = Object.values(UserRole);

    readonly roleLabels = USER_ROLE_LABELS;

    async updateUserRole(user: User, newRole: UserRole): Promise<void> {
        if (this.isLoading()) return;

        this.isLoading.set(true);
        this.error.set(null);
        this.successMessage.set(null);

        try {
            await this.userService.updateUserRole(user.id, newRole);
            this.successMessage.set(`Successfully updated ${user.displayName}'s role to ${this.roleLabels[newRole]}`);

        } catch (error) {
            this.error.set(`failed to update user role: ${error}`);
        } finally {
            this.isLoading.set(false);

            setTimeout(() => {
                this.successMessage.set(null);
                this.error.set(null);
            }, 3000);
        }
    }

    canEditUser(user: User): boolean {
        const current = this.currentUser();
        return current?.role === UserRole.ADMIN && current.id !== user.id;
    }

    getRoleBadgeClass(role: UserRole): string {
        const classMap = {
            [UserRole.ADMIN]: 'role-admin',
            [UserRole.PROJECT_MANAGER]: 'role-pm',
            [UserRole.DEVELOPER]: 'role-dev',
            [UserRole.QA_TESTER]: 'role-qa',
            [UserRole.REPORTER]: 'role-reporter'
        };
        return classMap[role] || '';
    }

    onRoleChange(user: User, event: Event): void {
        const selectElement = event.target as HTMLSelectElement;
        const newRole = selectElement.value as UserRole;
        this.updateUserRole(user, newRole);
    }

    isUserLoading = computed(() => (userId: string) =>
        this.loadingUserIds().has(userId))

    async toggleUserStatus(user: User): Promise<void> {
        const willDeactivate = user.isActive;

        if (willDeactivate) {
            const confirmed = confirm(
                `Deactivate ${user.displayName}? They won't to able able to log in.`
            );

            if (!confirmed) return;
        }

        this.loadingUserIds.update(ids => new Set(ids.add(user.id)));

        try {
            await this.userService.toggleUserStatus(user.id, !user.isActive);
        } catch (error) {
            console.error(`Failed to toggle user status:`, error);
        } finally {
            this.loadingUserIds.update(ids => {
                const newIds = new Set(ids);
                newIds.delete(user.id);
                return newIds;
            })
        }
    }

    getStatusButtonClass(user: User): string {
        const baseClass = "status-toggle-btn"
        const statusClass = user.isActive ? 'active' : 'inactive';
        const loadingClass = this.isUserLoading()(user.id) ? 'loading' : '';

        return `${baseClass} ${statusClass} ${loadingClass}`.trim();
    }
}




