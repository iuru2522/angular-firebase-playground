import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login-placeholder',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-placeholder.component.html',
  styleUrl: './login-placeholder.component.css',
  imports: [RouterModule]
})
export class LoginPlaceholderComponent {}