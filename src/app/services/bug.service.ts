import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { FirebaseInitService } from './firebase-init.service';
import { UserService } from './user.service';
import { collection, orderBy, query, Timestamp, addDoc, getDocs } from 'firebase/firestore';
import { take } from 'rxjs/operators';

export interface Bug {
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    reporter: string;
    assignee?: string;
    createdAt: Date;
    updatedAt: Date;
}

@Injectable({
    providedIn: 'root'
})
export class BugService {
    private readonly firebase = inject(FirebaseInitService);
    private readonly userService = inject(UserService);

    private bugsSubject = new BehaviorSubject<Bug[]>([]);
    public readonly bugs$ = this.bugsSubject.asObservable();

    private bugsSignal = signal<Bug[]>([]);
    readonly bugs = this.bugsSignal.asReadonly();

    addBug(bugData: Partial<Bug>): Observable<Bug> {
        const newBug: Bug = {
            id: this.generateBugId(),
            title: bugData.title || '',
            description: bugData.description || '',
            severity: bugData.severity || 'medium',
            status: 'open',
            reporter: bugData.reporter || 'Current User',
            createdAt: new Date(),
            updatedAt: new Date(),
            ...bugData
        };

        this.bugsSignal.update(bugs => [...bugs, newBug]);
        return of(newBug);
    }

    getAllBugs(): Observable<Bug[]>{
        return of(this.bugsSignal());
    }

    private generateBugId(): string {
        return 'BUG-' + Date.now().toString(36).toLowerCase();
    }

    async submitBug(bugData: {
        title: string;
        description: string;
        severity: 'critical' | 'high' | 'medium' | 'low';
    }): Promise<void>{
        const currentUser = await this.userService.getCurrentUser().pipe(
            take(1)).toPromise();
        if(!currentUser){
            throw new Error('User must be logged in to submit bugs.');
        }

        const newBug = {
            title: bugData.title,
            description: bugData.description,
            severity: bugData.severity,
            status: 'open' as const,
            reporter: currentUser.displayName,
            reportEmail: currentUser.email,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        const bugsCollection = collection(this.firebase.firestore, 'bugs');
        await addDoc(bugsCollection, newBug);
        this.loadBugs();
    }

    async loadBugs(): Promise<void>{
        const bugsCollection = collection(this.firebase.firestore, 'bugs');
        const bugsQuery = query(bugsCollection, orderBy('createdAt', 'desc'));

        const snapshot = await getDocs(bugsQuery);
        const bugs: Bug[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data()['createdAt'].toDate(),
            updatedAt: doc.data()['updatedAt'].toDate()
        })) as Bug[];

        this.bugsSubject.next(bugs);
        this.bugsSignal.set(bugs);
    }
}