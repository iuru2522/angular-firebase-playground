import { Injectable, inject, runInInjectionContext, Injector } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, doc, docData, setDoc, updateDoc, DocumentReference } from '@angular/fire/firestore';
import { Observable, of, from, timeout, catchError } from 'rxjs';
import { switchMap, map, catchError as rxjsCatchError } from 'rxjs/operators';
import { User, UserRole } from '../models';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly injector = inject(Injector);

    getCurrentUser(): Observable<User | null> {
        return runInInjectionContext(this.injector, () => {
            const auth = inject(Auth);
            
            return authState(auth).pipe(
                switchMap(authUser => {
                    if (!authUser) {
                        return of(null);
                    }

                    // Create a separate observable for Firestore operations
                    return this.getUserDocument(authUser.uid).pipe(
                        map(userData => {
                            if (!userData) {
                                // If no user document exists, create one with default role
                                const newUser: User = {
                                    id: authUser.uid,
                                    email: authUser.email ?? '',
                                    displayName: authUser.displayName ?? '',
                                    photoURL: authUser.photoURL ?? undefined,
                                    role: UserRole.REPORTER, // Default role
                                    isActive: true,
                                    createdAt: new Date(),
                                    updatedAt: new Date()
                                };
                                // Create user document asynchronously
                                this.createUserDocument(newUser).catch(error => {
                                    console.error('Failed to create user document:', error);
                                });
                                return newUser;
                            }
                            return userData;
                        }),
                        rxjsCatchError(error => {
                            console.error('Error fetching user document:', error);
                            return of(null);
                        })
                    );
                }),
                rxjsCatchError(error => {
                    console.error('Error in authState observable:', error);
                    return of(null);
                })
            );
        });
    }

    private getUserDocument(userId: string): Observable<User | null> {
        return runInInjectionContext(this.injector, () => {
            const firestore = inject(Firestore);
            try {
                const userDoc = doc(firestore, `users/${userId}`) as DocumentReference<User>;
                return docData<User>(userDoc).pipe(
                    timeout(15000), // 15 second timeout for Firestore operations
                    map(user => user || null),
                    rxjsCatchError(error => {
                        console.error('Firestore timeout or error:', error);
                        return of(null);
                    })
                );
            } catch (error) {
                console.error('Error creating document reference:', error);
                return of(null);
            }
        });
    }

    private createUserDocument(user: User): Promise<void> {
        return runInInjectionContext(this.injector, () => {
            const firestore = inject(Firestore);
            try {
                const userDoc = doc(firestore, `users/${user.id}`) as DocumentReference<User>;
                return setDoc(userDoc, user);
            } catch (error) {
                console.error('Error creating user document:', error);
                return Promise.reject(error);
            }
        });
    }

    updateUserRole(userId: string, role: UserRole): Promise<void> {
        return runInInjectionContext(this.injector, () => {
            const firestore = inject(Firestore);
            try {
                const userDoc = doc(firestore, `users/${userId}`) as DocumentReference<User>;
                return updateDoc(userDoc, {
                    role,
                    updatedAt: new Date()
                });
            } catch (error) {
                console.error('Error updating user role:', error);
                return Promise.reject(error);
            }
        });
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
}