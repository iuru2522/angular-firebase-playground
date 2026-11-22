import { Injectable, signal } from '@angular/core';
import { Bug } from '../services/bug.service';

@Injectable({ providedIn: 'root' })
export class BugListState {
  readonly search = signal('');
  readonly severity = signal<Bug['severity'] | ''>('');
  position: [number, number] = [0, 0];
}
