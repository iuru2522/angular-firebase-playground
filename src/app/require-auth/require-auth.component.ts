import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-require-auth',
  standalone: false,
  templateUrl: './require-auth.component.html',
  styleUrl: './require-auth.component.css'
})
export class RequireAuthComponent implements OnInit {
  user: firebase.User | null = null;

  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      this.user = user;
      if (!user) {
        this.router.navigate(['/signin']);
      }
    });
  }
}
