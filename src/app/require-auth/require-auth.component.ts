import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-require-auth',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './require-auth.component.html',
  styleUrl: './require-auth.component.css'
})
export class RequireAuthComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  user: User | null = null;

  ngOnInit(): void {
    this.authService.getAuthState().subscribe(user => {
      this.user = user;
      if (!user) {
        this.router.navigate(['/signin']);
      }
    });
  }
}
