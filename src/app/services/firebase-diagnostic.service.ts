import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { FirebaseApp } from '@angular/fire/app';

@Injectable({
  providedIn: 'root'
})
export class FirebaseDiagnosticService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly app = inject(FirebaseApp);
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  async diagnoseFirebase(): Promise<void> {
    // Only run diagnostics in browser context
    if (!isPlatformBrowser(this.platformId)) {
      console.log('🔍 Skipping Firebase diagnostics (SSR context)');
      return;
    }

    console.log('🔍 Starting Firebase diagnostics...');
    
    try {
      console.log('✅ Firebase app initialized:', this.app.name);
      
      // Test Auth
      try {
        console.log('✅ Firebase Auth initialized:', this.auth.app.name);
      } catch (error) {
        console.error('❌ Firebase Auth initialization failed:', error);
      }
      
      // Test Firestore
      try {
        console.log('✅ Firestore initialized:', this.firestore.app.name);
        
        // Try to read a test document
        const testDoc = doc(this.firestore, 'test', 'connection-test');
        await getDoc(testDoc);
        console.log('✅ Firestore connection test successful');
      } catch (error) {
        console.error('❌ Firestore initialization/connection failed:', error);
        console.log('💡 This might indicate:');
        console.log('   - Firestore is not enabled in your Firebase project');
        console.log('   - Security rules are blocking access');
        console.log('   - Network connectivity issues');
      }
    } catch (error) {
      console.error('❌ Firebase diagnostic failed:', error);
    }
  }
  async checkFirestoreRules(): Promise<void> {
    // Only run diagnostics in browser context
    if (!isPlatformBrowser(this.platformId)) {
      console.log('🔍 Skipping Firestore rules check (SSR context)');
      return;
    }

    console.log('🔍 Checking Firestore security rules...');
    
    try {
      // Try to read a document that should be accessible
      const testDoc = doc(this.firestore, 'users', 'test-user');
      await getDoc(testDoc);
      console.log('✅ Firestore security rules allow read access');
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