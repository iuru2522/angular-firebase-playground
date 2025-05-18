import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent implements OnInit {

  constructor(
    private afAuth: AngularFireAuth
  ) { }

  ngOnInit() { }

  _loginWithGoogle() {
      this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .then(googleResponse => {
          // Successfully logged in
          console.log(googleResponse);
          // Add your logic here
          
        }).catch(err => {
          // Login error
          console.log(err);
        });
  }
}
