import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { User, UserRole } from '../models';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly afAuth = inject(AngularFireAuth);
    private readonly firestore = inject(AngularFirestore);

    getCurrentUser(): Observable<User | null> {
        return this.afAuth.authState.pipe(
            switchMap(authUser => {
                if (!authUser) {
                    return of(null);
                }

                // Get user document from Firestore with role information
                return this.firestore.doc<User>(`users/${authUser.uid}`).valueChanges().pipe(
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
                            this.createUserDocument(newUser).catch(error => {
                                // Log error but do not break observable chain
                                console.error('Failed to create user document:', error);
                            });
                            return newUser;
                        }
                        return userData;
                    }),
                    catchError(error => {
                        console.error('Error fetching user document:', error);
                        return of(null);
                    })
                );
            }),
            catchError(error => {
                console.error('Error in authState observable:', error);
                return of(null);
            })
        );
    }

    private createUserDocument(user: User): Promise<void> {
        return this.firestore.doc(`users/${user.id}`).set(user);
    }

    updateUserRole(userId: string, role: UserRole): Promise<void> {
        return this.firestore.doc(`users/${userId}`).update({
            role,
            updatedAt: new Date()
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