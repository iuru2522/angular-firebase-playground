import { Directive, HostListener, Inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { GoogleAuthProvider } from "firebase/auth";

@Directive({
  selector: "[googleSso]",
  standalone: false,
})
export class GoogleSsoDirective {
  constructor(
    private afAuth: AngularFireAuth,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  
  @HostListener("click")
  async onClick() {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn("Authentication only works in browser environment");
      return;
    }

    try {
      await this.afAuth.signInWithRedirect(new GoogleAuthProvider());
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  }
}