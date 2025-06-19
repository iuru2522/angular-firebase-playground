import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
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

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() => {
      try {
        const app = initializeApp(firebaseConfig);
        console.log('Firebase app initialized successfully');
        return app;
      } catch (error) {
        console.error('Failed to initialize Firebase app:', error);
        throw error;
      }
    }),
    provideAuth(() => {
      try {
        const auth = getAuth();
        console.log('Firebase Auth initialized successfully');
        return auth;
      } catch (error) {
        console.error('Failed to initialize Firebase Auth:', error);
        throw error;
      }
    }),
    provideFirestore(() => {
      try {
        const firestore = getFirestore();
        console.log('Firestore initialized successfully');
        return firestore;
      } catch (error) {
        console.error('Failed to initialize Firestore:', error);
        throw error;
      }
    })
  ]
}).catch(err => {
  console.error('Bootstrap error:', err);
  // Show a user-friendly error message
  document.body.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
      <div style="text-align: center; padding: 2rem;">
        <h2>⚠️ Application Error</h2>
        <p>Failed to initialize the application. Please refresh the page or try again later.</p>
        <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    </div>
  `;
});
