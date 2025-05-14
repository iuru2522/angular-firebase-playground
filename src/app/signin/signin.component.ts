import { Component } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";

@Component({
  selector: "app-signin",
  standalone: false,
  templateUrl: "./signin.component.html",
  styleUrl: "./signin.component.css",
})

export class SigninComponent {
  constructor(public angularFireAuth: AngularFireAuth) {}
  logOut() {
    this.angularFireAuth.signOut();
  }
}