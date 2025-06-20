import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../firebase-config';

@Injectable({ providedIn: 'root' })
export class FirebaseInitService {
  private app = initializeApp(firebaseConfig);

  public auth = getAuth(this.app);
  public firestore = getFirestore(this.app);
} 