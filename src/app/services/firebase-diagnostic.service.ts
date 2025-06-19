import { Injectable, inject, runInInjectionContext, Injector } from '@angular/core';
import { Auth, getAuth } from '@angular/fire/auth';
import { Firestore, getFirestore, doc, getDoc } from '@angular/fire/firestore';
import { FirebaseApp } from '@angular/fire/app';

@Injectable({
  providedIn: 'root'
})
export class FirebaseDiagnosticService {
  private readonly injector = inject(Injector);

  async diagnoseFirebase(): Promise<void> {
    console.log('🔍 Starting Firebase diagnostics...');
    
    try {
      await runInInjectionContext(this.injector, async () => {
        const app = inject(FirebaseApp);
        console.log('✅ Firebase app initialized:', app.name);
        
        // Test Auth
        try {
          const auth = inject(Auth);
          console.log('✅ Firebase Auth initialized:', auth.app.name);
        } catch (error) {
          console.error('❌ Firebase Auth initialization failed:', error);
        }
        
        // Test Firestore
        try {
          const firestore = inject(Firestore);
          console.log('✅ Firestore initialized:', firestore.app.name);
          
          // Try to read a test document
          const testDoc = doc(firestore, 'test', 'connection-test');
          await getDoc(testDoc);
          console.log('✅ Firestore connection test successful');
        } catch (error) {
          console.error('❌ Firestore initialization/connection failed:', error);
          console.log('💡 This might indicate:');
          console.log('   - Firestore is not enabled in your Firebase project');
          console.log('   - Security rules are blocking access');
          console.log('   - Network connectivity issues');
        }
      });
    } catch (error) {
      console.error('❌ Firebase diagnostic failed:', error);
    }
  }

  async checkFirestoreRules(): Promise<void> {
    console.log('🔍 Checking Firestore security rules...');
    
    try {
      await runInInjectionContext(this.injector, async () => {
        const firestore = inject(Firestore);
        
        // Try to read a document that should be accessible
        const testDoc = doc(firestore, 'users', 'test-user');
        await getDoc(testDoc);
        console.log('✅ Firestore security rules allow read access');
      });
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        console.error('❌ Firestore security rules are blocking access');
        console.log('💡 Check your Firestore security rules in the Firebase Console');
      } else {
        console.error('❌ Firestore access error:', error);
      }
    }
  }
} 