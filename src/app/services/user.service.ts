import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, doc, docData, setDoc, updateDoc, DocumentReference } from '@angular/fire/firestore';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { switchMap, map, catchError as rxjsCatchError } from 'rxjs/operators';
import { User, UserRole } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
    private readonly auth = inject(Auth);
    private readonly firestore = inject(Firestore);
    private readonly platformId = inject(PLATFORM_ID);

    getCurrentUser(): Observable<User | null> {
        if (!isPlatformBrowser(this.platformId)) return of(null);
        return authState(this.auth).pipe(
            switchMap(authUser => {
                if (!authUser) return of(null);
                return this.getUserDocument(authUser.uid).pipe(
                    switchMap(userData => {
                        if (!userData) {
                            const newUser: User = {
                                id: authUser.uid,
                                email: authUser.email ?? '',
                                displayName: authUser.displayName ?? '',
                                photoURL: authUser.photoURL ?? undefined,
                                role: UserRole.REPORTER,
                                isActive: true,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            };
                            return this.createUserDocumentObservable(newUser).pipe(
                                map(() => newUser),
                                rxjsCatchError(error => {
                                    console.error('Failed to create user document:', error);
                                    return of(newUser);
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
        if (!isPlatformBrowser(this.platformId)) return of(null);
        try {
            const userDoc = doc(this.firestore, `users/${userId}`) as DocumentReference<User>;
            return docData<User>(userDoc).pipe(
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
        if (!isPlatformBrowser(this.platformId)) return of();
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
        if (!isPlatformBrowser(this.platformId)) return Promise.resolve();
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