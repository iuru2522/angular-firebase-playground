import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'angular-firebase-playground';
  user: firebase.User | null = null;
  
  constructor(
    private afAuth: AngularFireAuth,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Only run authentication code in browser
    if (isPlatformBrowser(this.platformId)) {
      // Check for redirect result when the app initializes
      this.afAuth.getRedirectResult().then(result => {
        if (result.user) {
          // User successfully authenticated
          console.log('User signed in after redirect:', result.user);
          this.user = result.user;
        }
      }).catch(error => {
        console.error('Error after redirect:', error);
      });
    }
  }
  
  ngOnInit() {
    // Track authentication state only in browser
    if (isPlatformBrowser(this.platformId)) {
      this.afAuth.authState.subscribe(user => {
        this.user = user;
        console.log('Auth state changed:', user);
      });
    }
  }
  
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      this.afAuth.signOut();
    }
  }
}