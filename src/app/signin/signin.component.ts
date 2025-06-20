import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { Observable } from "rxjs";
import { User } from "firebase/auth";
import { GoogleSsoDirective } from "../google-sso.directive";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-signin",
  standalone: true,
  imports: [CommonModule, RouterModule, GoogleSsoDirective],
  templateUrl: "./signin.component.html",
  styleUrl: "./signin.component.css",
})
export class SigninComponent {
  private readonly authService = inject(AuthService);
  
  public readonly authState$ = this.authService.authState$;

  async logOut(): Promise<void> {
    await this.authService.logout();
  }
}