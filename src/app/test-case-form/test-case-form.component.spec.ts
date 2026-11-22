import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';
import { TestCaseService } from '../services/test-case.service';

import { TestCaseFormComponent } from './test-case-form.component';

describe('TestCaseFormComponent', () => {
  let component: TestCaseFormComponent;
  let fixture: ComponentFixture<TestCaseFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestCaseFormComponent],
      providers: [
        provideRouter(routes.filter((route) => route.path?.startsWith('test-cases'))),
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestCaseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('rejects a duplicate without losing the form, then creates and edits the new record', async () => {
    const service = TestBed.inject(TestCaseService);
    service.addTestCase({ id: 'TC-001', title: 'Existing test', status: 'Ready' });
    const harness = await RouterTestingHarness.create('/test-cases-form');
    const set = (id: string, value: string) => {
      const field = harness.routeNativeElement!.querySelector<HTMLInputElement | HTMLSelectElement>('#' + id)!;
      field.value = value;
      field.dispatchEvent(new Event(field.tagName === 'SELECT' ? 'change' : 'input'));
    };
    const submit = async () => {
      harness.routeNativeElement!.querySelector('form')!.dispatchEvent(new Event('submit'));
      await harness.fixture.whenStable();
      harness.detectChanges();
    };
    set('title', 'New test case');
    set('testCaseId', 'TC-001');
    set('description', 'Verify the password reset flow.');
    set('testType', 'regression');
    await submit();
    expect(harness.routeNativeElement?.textContent).toContain('This test case ID already exists');
    expect(harness.routeNativeElement?.querySelector<HTMLInputElement>('#title')?.value).toBe('New test case');
    expect(service.testCases().length).toBe(1);

    set('testCaseId', 'TC-002');
    await submit();
    expect(harness.routeNativeElement?.textContent).toContain('Test case created.');
    const createdAt = service.getTestCaseById('TC-002')?.createdAt;
    await harness.navigateByUrl('/test-cases-form/TC-002');
    set('title', 'Updated test case');
    await submit();
    expect(service.getTestCaseById('TC-002')?.title).toBe('Updated test case');
    expect(service.getTestCaseById('TC-002')?.createdAt).toBe(createdAt);
    expect(service.getTestCaseById('TC-001')?.title).toBe('Existing test');
  });
});
