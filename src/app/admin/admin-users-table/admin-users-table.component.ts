import { ChangeDetectionStrategy, Component, computed, inject, signal, TemplateRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { User, UserRole, USER_ROLE_LABELS } from '../../models';
import { UserService } from '../../services/user.service';

type AccountChange =
  | { kind: 'role'; user: User; role: UserRole }
  | { kind: 'status'; user: User; active: boolean };

interface RowFeedback {
  kind: 'pending' | 'success' | 'error';
  message: string;
}

@Component({
  selector: 'app-admin-users-table',
  templateUrl: './admin-users-table.component.html',
  styleUrls: ['../admin-shell.css', './admin-users-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogModule, RouterLink],
})
export class AdminUsersTableComponent {
  private readonly service = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private readonly users = signal<User[]>([]);
  private readonly currentUser = toSignal(this.service.getCurrentUser());
  private readonly drafts = signal<ReadonlyMap<string, UserRole>>(new Map());

  protected readonly search = signal('');
  protected readonly status = signal<'all' | 'active' | 'inactive'>('all');
  protected readonly directoryState = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly feedback = signal<ReadonlyMap<string, RowFeedback>>(new Map());
  protected readonly filters = ['all', 'active', 'inactive'] as const;
  protected readonly roles = Object.values(UserRole);
  protected readonly roleLabels = USER_ROLE_LABELS;
  protected readonly visibleUsers = computed(() => {
    const query = this.search().trim().toLowerCase();
    const status = this.status();
    return this.users().filter((user) =>
      (status === 'all' || !!user.isActive === (status === 'active')) &&
      [user.displayName, user.email].some((value) => value?.toLowerCase().includes(query)),
    );
  });

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.directoryState.set('loading');
    try {
      this.users.set(await firstValueFrom(this.service.getAllUsers()));
      this.directoryState.set('ready');
    } catch {
      this.directoryState.set('error');
    }
  }

  protected isSelf(user: User): boolean {
    return this.currentUser()?.id === user.id;
  }

  protected canEditRole(user: User): boolean {
    return this.currentUser()?.role === UserRole.ADMIN && !this.isSelf(user);
  }

  protected canEditStatus(): boolean {
    return this.currentUser()?.role === UserRole.ADMIN;
  }

  protected roleDraft(user: User): UserRole {
    return this.drafts().get(user.id) ?? user.role;
  }

  protected roleLabel(role: UserRole): string {
    return this.roleLabels[role];
  }

  protected selectRole(user: User, value: string): void {
    const role = this.roles.find((option) => option === value);
    if (role) this.drafts.update((drafts) => new Map(drafts).set(user.id, role));
  }

  protected confirmRole(template: TemplateRef<{ $implicit: AccountChange }>, user: User): void {
    const role = this.roleDraft(user);
    if (role !== user.role) this.confirm(template, { kind: 'role', user, role });
  }

  protected confirmStatus(template: TemplateRef<{ $implicit: AccountChange }>, user: User): void {
    this.confirm(template, { kind: 'status', user, active: !user.isActive });
  }

  private confirm(template: TemplateRef<{ $implicit: AccountChange }>, change: AccountChange): void {
    const id = 'confirm-account-change';
    if (this.dialog.getDialogById(id) || !this.canApply(change)) return;

    this.dialog.open<{ $implicit: AccountChange }, AccountChange, boolean>(template, {
      id,
      data: change,
      width: '28rem',
    }).afterClosed().subscribe((confirmed) => {
      if (confirmed) void this.apply(change);
    });
  }

  private canApply(change: AccountChange): boolean {
    return this.feedback().get(change.user.id)?.kind !== 'pending' &&
      (change.kind === 'role' ? this.canEditRole(change.user) : this.canEditStatus());
  }

  private async apply(change: AccountChange): Promise<void> {
    if (!this.canApply(change)) return;
    const { id } = change.user;
    const subject = change.kind === 'role' ? 'role' : 'account status';
    this.setFeedback(id, { kind: 'pending', message: 'Updating ' + subject + '...' });
    try {
      if (change.kind === 'role') await this.service.updateUserRole(id, change.role);
      else await this.service.toggleUserStatus(id, change.active);
      this.users.update((users) => users.map((user) => user.id === id
        ? { ...user, ...(change.kind === 'role' ? { role: change.role } : { isActive: change.active }) }
        : user));
      this.setFeedback(id, {
        kind: 'success',
        message: change.kind === 'role' ? 'Role updated to ' + this.roleLabels[change.role] + '.'
          : change.active ? 'Account reactivated.' : 'Account deactivated.',
      });
    } catch {
      this.setFeedback(id, { kind: 'error', message: 'Could not update ' + subject + '. Try again.' });
    }
  }

  private setFeedback(id: string, feedback: RowFeedback): void {
    this.feedback.update((rows) => new Map(rows).set(id, feedback));
  }
}
