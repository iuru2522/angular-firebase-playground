import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { BugService } from '../services/bug.service';

import { FileBugComponent } from './file-bug.component';

describe('FileBugComponent', () => {
  let component: FileBugComponent;
  let fixture: ComponentFixture<FileBugComponent>;
  let service: jasmine.SpyObj<BugService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj<BugService>('BugService', ['submitBug']);
    await TestBed.configureTestingModule({
      imports: [FileBugComponent],
      providers: [
        provideRouter([]),
        { provide: BugService, useValue: service },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileBugComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('preserves input after a failed save and returns to the list after retry', async () => {
    const router = TestBed.inject(Router);
    const navigate = spyOn(router, 'navigate').and.resolveTo(true);
    service.submitBug.and.rejectWith(new Error('Offline'));
    const host: HTMLElement = fixture.nativeElement;
    const title = host.querySelector<HTMLInputElement>('#title')!;
    const description = host.querySelector<HTMLTextAreaElement>('#description')!;
    title.value = 'Password reset fails';
    title.dispatchEvent(new Event('input'));
    description.value = 'The latest password reset link will not open.';
    description.dispatchEvent(new Event('input'));
    const form = host.querySelector('form')!;
    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(host.textContent).toContain('Your entries are still here');
    expect(title.value).toBe('Password reset fails');
    expect(description.value).toContain('password reset');
    expect(navigate).not.toHaveBeenCalled();

    service.submitBug.and.resolveTo();
    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(service.submitBug).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenCalledWith(['/bug-list'], {
      state: { bugReportFeedback: 'Bug report filed.' },
    });
    expect(component.canLeave()).toBeTrue();
  });
});
