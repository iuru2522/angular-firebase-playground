import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { routes } from '../app.routes';
import { TestCaseService } from '../services/test-case.service';

import { TestCasesComponent } from './test-cases.component';

describe('TestCasesComponent', () => {
  let component: TestCasesComponent;
  let fixture: ComponentFixture<TestCasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestCasesComponent],
      providers: [provideRouter(routes.filter((route) => route.path?.startsWith('test-cases'))), provideNoopAnimations()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestCasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the empty list and routes directly to seeded details, edit, and missing states', async () => {
    const harness = await RouterTestingHarness.create('/test-cases');
    expect(harness.routeNativeElement?.textContent).toContain('No test cases yet');
    TestBed.inject(TestCaseService).addTestCase({ id: 'TC-001', title: 'Password reset', status: 'Ready' });
    await harness.navigateByUrl('/test-cases/TC-001');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Password reset');
    await harness.navigateByUrl('/test-cases-form/TC-001');
    expect(harness.routeNativeElement?.querySelector<HTMLInputElement>('#title')?.value).toBe('Password reset');
    expect(harness.routeNativeElement?.querySelector<HTMLInputElement>('#testCaseId')?.disabled).toBeTrue();
    await harness.navigateByUrl('/test-cases-form/TC-999');
    expect(harness.routeNativeElement?.textContent).toContain('Test case not found');
    await harness.navigateByUrl('/test-cases/TC-999');
    expect(harness.routeNativeElement?.querySelector('a[href="/test-cases"]')).toBeTruthy();
  });

  it('cancels deletion and deletes only the confirmed row', async () => {
    const service = TestBed.inject(TestCaseService);
    service.addTestCase({ id: 'TC-001', title: 'Password reset', status: 'Ready' });
    service.addTestCase({ id: 'TC-002', title: 'Navigation', status: 'Draft' });
    const harness = await RouterTestingHarness.create('/test-cases');
    const overlays = TestBed.inject(OverlayContainer).getContainerElement();
    const click = async (button: HTMLButtonElement | null | undefined) => {
      expect(button).toBeTruthy();
      button?.click();
      harness.detectChanges();
      await harness.fixture.whenStable();
      harness.detectChanges();
    };
    for (const decision of ['Cancel', 'Delete']) {
      await click(harness.routeNativeElement?.querySelector('button[aria-label="Actions for Password reset"]'));
      await click(Array.from(overlays.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent?.trim() === 'Delete test case'));
      await click(Array.from(overlays.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent?.trim() === decision));
      expect(service.testCases().map((record) => record.id)).toEqual(decision === 'Cancel' ? ['TC-001', 'TC-002'] : ['TC-002']);
    }
  });
});
