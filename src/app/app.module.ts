import { NgModule } from "@angular/core";
import { BrowserModule, provideClientHydration, withEventReplay } from "@angular/platform-browser";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AngularFireModule } from "@angular/fire/compat";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { LoginComponent } from './login/login.component';
import { LandingComponent } from './landing/landing.component';
import { SigninComponent } from './signin/signin.component';
import { RequireAuthComponent } from './require-auth/require-auth.component';
import { GoogleSsoDirective } from './google-sso.directive';

export const firebaseConfig = {
 apiKey: "AIzaSyAxbWLeDDJRIDf45xorZiMTHdtZ67XlrTA",
  authDomain: "test-ang-auth.firebaseapp.com",
  projectId: "test-ang-auth",
  storageBucket: "test-ang-auth.firebasestorage.app",
  messagingSenderId: "346480172811",
  appId: "1:346480172811:web:891ff85cd4b79d57f00c0e",
  measurementId: "G-RV90G4H1L1"
};

@NgModule({
  declarations: [
    AppComponent, 
    LoginComponent,
    LandingComponent,
    SigninComponent,
    RequireAuthComponent,
    GoogleSsoDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(firebaseConfig),
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    AngularFireAuth
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
