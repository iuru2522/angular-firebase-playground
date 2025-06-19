import { Component, inject, runInInjectionContext, Injector } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { Auth, authState, signOut } from "@angular/fire/auth";
import { Observable } from "rxjs";
import { User } from "firebase/auth";
import { GoogleSsoDirective } from "../google-sso.directive";

@Component({
  selector: "app-signin",
  standalone: true,
  imports: [CommonModule, RouterModule, GoogleSsoDirective],
  templateUrl: "./signin.component.html",
  styleUrl: "./signin.component.css",
})
export class SigninComponent {
  private readonly injector = inject(Injector);
  
  get authState$(): Observable<User | null> {
    return runInInjectionContext(this.injector, () => {
      const auth = inject(Auth);
      return authState(auth);
    });
  }

  async logOut(): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const auth = inject(Auth);
      await signOut(auth);
    });
  }
}