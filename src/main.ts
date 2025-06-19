import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';
import { provideFirestore, getFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { AppComponent } from './app/app.component';
import { routes } from './app/app-routing.module';

export const firebaseConfig = {
  apiKey: "AIzaSyAxbWLeDDJRIDf45xorZiMTHdtZ67XlrTA",
  authDomain: "test-ang-auth.firebaseapp.com",
  projectId: "test-ang-auth",
  storageBucket: "test-ang-auth.firebasestorage.app",
  messagingSenderId: "346480172811",
  appId: "1:346480172811:web:891ff85cd4b79d57f00c0e",
  measurementId: "G-RV90G4H1L1"
};

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() => {
      try {
        return initializeApp(firebaseConfig);
      } catch (error) {
        console.error('Failed to initialize Firebase app:', error);
        throw error;
      }
    }),
    provideAuth(() => {
      try {
        const auth = getAuth();
        return auth;
      } catch (error) {
        console.error('Failed to initialize Firebase Auth:', error);
        throw error;
      }
    }),
    provideFirestore(() => {
      try {
        const firestore = getFirestore();
        return firestore;
      } catch (error) {
        console.error('Failed to initialize Firestore:', error);
        throw error;
      }
    })
  ]
}).catch(err => console.error('Bootstrap error:', err));
