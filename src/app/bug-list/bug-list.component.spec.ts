import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Bug, BugService } from '../services/bug.service';
import { BugListState } from './bug-list-state';

import { BugListComponent } from './bug-list.component';

describe('BugListComponent', () => {
  let component: BugListComponent;
  let fixture: ComponentFixture<BugListComponent>;
  let service: jasmine.SpyObj<BugService>;
  const sample: Bug = {
    id: 'BT-104', title: 'Password reset link expires', description: 'The latest link will not open.',
    severity: 'high', status: 'open', reporter: 'Alex Morgan', createdAt: new Date(), updatedAt: new Date(),
  };

  beforeEach(async () => {
    service = jasmine.createSpyObj<BugService>('BugService', ['loadBugs'], {
      bugs$: new BehaviorSubject([sample]),
    });
    service.loadBugs.and.resolveTo();
    await TestBed.configureTestingModule({
      imports: [BugListComponent],
      providers: [provideRouter([]), { provide: BugService, useValue: service }],
    })
    .compileComponents();

    fixture = TestBed.createComponent(BugListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('restores filters, searches by ID, and clears filters from the empty result state', async () => {
    const state = TestBed.inject(BugListState);
    state.search.set('#BT-104');
    state.severity.set('low');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain('No matching bug reports');
    expect(host.querySelector<HTMLInputElement>('input[type="search"]')?.value).toBe('#BT-104');
    host.querySelector<HTMLButtonElement>('button')!.click();
    fixture.detectChanges();
    expect(state.severity()).toBe('');
    expect(host.querySelector('a[href="/bug-details/BT-104"]')?.textContent).toContain(sample.title);
  });

  it('keeps a failed load separate from an empty list and offers retry', async () => {
    fixture.destroy();
    service.loadBugs.and.rejectWith(new Error('Offline'));
    fixture = TestBed.createComponent(BugListComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain('Could not load bug reports');
    expect(host.textContent).not.toContain('No bug reports yet');
    service.loadBugs.and.resolveTo();
    host.querySelector<HTMLButtonElement>('button')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(host.textContent).toContain(sample.title);
  });
});
