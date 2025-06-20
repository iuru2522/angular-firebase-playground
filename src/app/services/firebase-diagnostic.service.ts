import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FirebaseInitService } from './firebase-init.service';
import { doc, getDoc } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class FirebaseDiagnosticService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly firebase = inject(FirebaseInitService);

  async diagnoseFirebase(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      console.log('🔍 Skipping Firebase diagnostics (SSR context)');
      return;
    }

    console.log('🔍 Starting Firebase diagnostics...');
    try {
      console.log('✅ Firebase app initialized:', this.firebase.auth.app.name);
      console.log('✅ Firebase Auth initialized:', this.firebase.auth.app.name);
      console.log('✅ Firestore initialized:', this.firebase.firestore.app.name);
    } catch (error) {
      console.error('❌ Firebase diagnostics failed:', error);
    }
  }

  async checkFirestoreRules(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const testDoc = doc(this.firebase.firestore, 'users', 'test-user');
      await getDoc(testDoc);
      console.log('✅ Firestore security rules allow read access');
    } catch (error) {
      console.error('❌ Firestore security rules block read access:', error);
    }
  }
} 