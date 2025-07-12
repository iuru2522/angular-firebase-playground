import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { from, Observable, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, DocumentReference, collection, getDocs, Firestore } from 'firebase/firestore';

import { FirebaseInitService } from './firebase-init.service';
import { User as AppUser } from '../models/user.interface';
import { UserRole } from '../models/user-role.enum';

@Injectable({ providedIn: 'root' })
export class UserService {
    private readonly firebase = inject(FirebaseInitService);
    private readonly platformId = inject(PLATFORM_ID);
    // private readonly firestore = inject(Firestore);

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
                            role: UserRole.REPORTER,
                            isActive: true,
                            createdAt: now,
                            updatedAt: now
                        };

                        // Only add photoURL if it exists
                        if (authUser.photoURL) {
                            newUser.photoURL = authUser.photoURL;
                        }
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

        // Filter out undefined values to prevent Firestore errors
        const cleanUserData = Object.fromEntries(
            Object.entries(user).filter(([_, value]) => value !== undefined)
        );

        return from(setDoc(userDocRef, cleanUserData));
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

    async toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
        const userRef = doc(this.firebase.firestore, `users/${userId}`);
        await updateDoc(userRef, {
            isActive,
            updatedAt: new Date()
        });
    }

    async activateUser(userId: string): Promise<void> {
        return this.toggleUserStatus(userId, true);
    }

    async deactivateUser(userId: string): Promise<void> {
        return this.toggleUserStatus(userId, false);
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