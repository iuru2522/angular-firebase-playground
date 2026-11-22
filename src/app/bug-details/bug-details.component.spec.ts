import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { BugService } from '../services/bug.service';

import { BugDetailsComponent } from './bug-details.component';

describe('BugDetailsComponent', () => {
  let component: BugDetailsComponent;
  let fixture: ComponentFixture<BugDetailsComponent>;
  let service: jasmine.SpyObj<BugService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj<BugService>('BugService', ['getBugById']);
    await TestBed.configureTestingModule({
      imports: [BugDetailsComponent],
      providers: [
        provideRouter([{ path: 'bug-details/:id', component: BugDetailsComponent }]),
        { provide: BugService, useValue: service },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(BugDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens a direct report link and distinguishes missing data from a failed read', async () => {
    service.getBugById.and.resolveTo({
      id: 'BT-104', title: 'Password reset link expires', description: 'The latest link will not open.',
      severity: 'high', status: 'open', reporter: 'Alex Morgan', createdAt: new Date(), updatedAt: new Date(),
    });
    const harness = await RouterTestingHarness.create('/bug-details/BT-104');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Password reset link expires');
    expect(service.getBugById).toHaveBeenCalledWith('BT-104');

    service.getBugById.and.rejectWith(new Error('Offline'));
    await harness.navigateByUrl('/bug-details/unavailable');
    expect(harness.routeNativeElement?.textContent).toContain('Could not load this report');
    service.getBugById.and.resolveTo(null);
    await harness.navigateByUrl('/bug-details/missing');
    expect(harness.routeNativeElement?.textContent).toContain('Bug not found');
  });
});
