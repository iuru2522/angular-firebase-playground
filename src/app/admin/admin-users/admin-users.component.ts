import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { UserRole, USER_ROLE_DESCRIPTIONS, USER_ROLE_LABELS } from '../../models';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['../admin-shell.css', './admin-users.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, RouterLink],
})
export class AdminUsersComponent {
  protected readonly currentUser = toSignal(inject(UserService).getCurrentUser());
  protected readonly roles = Object.values(UserRole);
  protected readonly labels = USER_ROLE_LABELS;
  protected readonly descriptions = USER_ROLE_DESCRIPTIONS;
}
