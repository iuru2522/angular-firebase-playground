import { Component, OnInit, inject, runInInjectionContext, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, authState } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-require-auth',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './require-auth.component.html',
  styleUrl: './require-auth.component.css'
})
export class RequireAuthComponent implements OnInit {
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  user: User | null = null;

  ngOnInit(): void {
    runInInjectionContext(this.injector, () => {
      const auth = inject(Auth);
      authState(auth).subscribe(user => {
        this.user = user;
        if (!user) {
          this.router.navigate(['/signin']);
        }
      });
    });
  }
}
