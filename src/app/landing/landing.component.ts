import { MatButtonModule } from '@angular/material/button';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '../services/user.service';
import { WorkspaceComponent } from '../workspace/workspace.component';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, RouterLink, WorkspaceComponent],
})
export class LandingComponent {
  readonly user = toSignal(inject(UserService).getCurrentUser(), { initialValue: null });
}
