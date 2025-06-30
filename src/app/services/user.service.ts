import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { from, Observable, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, DocumentReference, collection, getDocs } from 'firebase/firestore';

import { FirebaseInitService } from './firebase-init.service';
import { User as AppUser } from '../models/user.interface';
import { UserRole } from '../models/user-role.enum';

@Injectable({ providedIn: 'root' })
export class UserService {
    private readonly firebase = inject(FirebaseInitService);
    private readonly platformId = inject(PLATFORM_ID);

    getCurrentUser(): Observable<AppUser | null> {
        if (!isPlatformBrowser(this.platformId)) return of(null);
        return new Observable<FirebaseUser | null>(subscriber => {
            return onAuthStateChanged(this.firebase.auth, user => subscriber.next(user));
        }).pipe(
            switchMap((authUser: FirebaseUser | null) => {
                if (!authUser) return of(null);
                return this.getUserDocument(authUser.uid).pipe(
                    switchMap((userDoc: AppUser | null) => {
                        if (userDoc) return of(userDoc);
                        // If user doc doesn't exist, create it
                        const now = new Date();
                        const newUser: AppUser = {
                            id: authUser.uid,
                            email: authUser.email ?? '',
                            displayName: authUser.displayName ?? '',
                            photoURL: authUser.photoURL ?? undefined,
                            role: UserRole.REPORTER,
                            isActive: true,
                            createdAt: now,
                            updatedAt: now
                        };
                        return this.createUserDocument(newUser).pipe(
                            switchMap(() => this.getUserDocument(authUser.uid))
                        );
                    })
                );
            }),
            map((userDoc: any) => userDoc ? this.mapToAppUser(userDoc) : null)
        );
    }

    getUserDocument(uid: string): Observable<AppUser | null> {
        const userDocRef = doc(this.firebase.firestore, 'users', uid);
        return from(getDoc(userDocRef)).pipe(
            map(snapshot => snapshot.exists() ? this.mapToAppUser(snapshot.data()) : null)
        );
    }

    createUserDocument(user: AppUser): Observable<void> {
        const userDocRef = doc(this.firebase.firestore, 'users', user.id);
        return from(setDoc(userDocRef, user));
    }

    updateUserDocument(uid: string, data: Partial<AppUser>): Observable<void> {
        const userDocRef = doc(this.firebase.firestore, 'users', uid);
        return from(updateDoc(userDocRef, data));
    }

    updateUserRole(userId: string, role: UserRole): Promise<void> {
        if (!isPlatformBrowser(this.platformId)) return Promise.resolve();
        try {
            const userDoc = doc(this.firebase.firestore, `users/${userId}`) as DocumentReference<AppUser>;
            return updateDoc(userDoc, {
                role,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error updating user role:', error);
            return Promise.reject(error);
        }
    }

    hasRole(role: UserRole): Observable<boolean> {
        return this.getCurrentUser().pipe(
            map(user => user?.role === role || false)
        );
    }

    hasAnyRole(roles: UserRole[]): Observable<boolean> {
        return this.getCurrentUser().pipe(
            map(user => user ? roles.includes(user.role) : false)
        );
    }

    getAllUsers(): Observable<AppUser[]> {
        if (!isPlatformBrowser(this.platformId)) {
            return of([])
        }

        const usersRef = collection(this.firebase.firestore, 'users');

        return from(getDocs(usersRef)).pipe(
            map(snapshot => {
                return snapshot.docs.map(doc => {
                    const data = doc.data();
                    return this.mapToAppUser({ id: doc.id, ...data });
                });
            }),
            catchError(error => {
                console.error('Error fetching users:', error);
                return of([]);
            })
        );


    }

    private mapToAppUser(data: any): AppUser {
        return {
            id: data.id,
            email: data.email,
            displayName: data.displayName,
            photoURL: data.photoURL,
            role: data.role,
            isActive: data.isActive,
            createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt),
            updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt),
        };
    }
}