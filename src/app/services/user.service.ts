import { Injectable, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, doc, docData, setDoc, updateDoc, DocumentReference } from '@angular/fire/firestore';
import { Observable, of, timeout, catchError } from 'rxjs';
import { switchMap, map, catchError as rxjsCatchError } from 'rxjs/operators';
import { User, UserRole } from '../models';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly auth = inject(Auth);
    private readonly firestore = inject(Firestore);

    getCurrentUser(): Observable<User | null> {
        return authState(this.auth).pipe(
            switchMap(authUser => {
                if (!authUser) {
                    return of(null);
                }

                return this.getUserDocument(authUser.uid).pipe(
                    switchMap(userData => {
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
                            
                            // Create user document and return the new user
                            return this.createUserDocumentObservable(newUser).pipe(
                                map(() => newUser),
                                rxjsCatchError(error => {
                                    console.error('Failed to create user document:', error);
                                    return of(newUser); // Return user even if document creation fails
                                })
                            );
                        }
                        return of(userData);
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
    }

    private getUserDocument(userId: string): Observable<User | null> {
        try {
            const userDoc = doc(this.firestore, `users/${userId}`) as DocumentReference<User>;
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
    }

    private createUserDocumentObservable(user: User): Observable<void> {
        try {
            const userDoc = doc(this.firestore, `users/${user.id}`) as DocumentReference<User>;
            return new Observable<void>(observer => {
                setDoc(userDoc, user)
                    .then(() => {
                        observer.next();
                        observer.complete();
                    })
                    .catch(error => {
                        console.error('Error in setDoc:', error);
                        observer.error(error);
                    });
            });
        } catch (error) {
            console.error('Error creating user document:', error);
            return new Observable<void>(observer => {
                observer.error(error);
            });
        }
    }

    updateUserRole(userId: string, role: UserRole): Promise<void> {
        try {
            const userDoc = doc(this.firestore, `users/${userId}`) as DocumentReference<User>;
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
}