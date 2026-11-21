import { Component, inject, ChangeDetectionStrategy, effect } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { WorkspaceComponent } from '../workspace/workspace.component';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-require-auth',
  templateUrl: './require-auth.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WorkspaceComponent]
})
export class RequireAuthComponent {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly user = toSignal(this.userService.getCurrentUser());

  constructor() {
    effect(() => {
      const currentUser = this.user();
      if (currentUser === null) {
        this.router.navigate(['/signin']);
      }
    });
  }
}
