import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GoogleSsoDirective } from '../google-sso.directive';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, GoogleSsoDirective]
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  ngOnInit(): void {
    this.authService.authState$.subscribe((user: any) => {
      if (user) {
        this.router.navigate(['/dashboard']);
      }
    });
  }
}
