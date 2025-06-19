import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
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

const bootstrap = () => bootstrapApplication(AppComponent, {
  providers: [
    provideServerRendering(),
    provideRouter(routes),
    provideFirebaseApp(() => {
      try {
        return initializeApp(firebaseConfig);
      } catch (error) {
        console.error('Failed to initialize Firebase app (server):', error);
        throw error;
      }
    }),
    provideAuth(() => {
      try {
        const auth = getAuth();
        return auth;
      } catch (error) {
        console.error('Failed to initialize Firebase Auth (server):', error);
        throw error;
      }
    }),
    provideFirestore(() => {
      try {
        const firestore = getFirestore();
        return firestore;
      } catch (error) {
        console.error('Failed to initialize Firestore (server):', error);
        throw error;
      }
    })
  ]
});

export default bootstrap;
