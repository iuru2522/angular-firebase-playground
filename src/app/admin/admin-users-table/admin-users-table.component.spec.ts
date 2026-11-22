import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { BehaviorSubject, map, of } from 'rxjs';
import { routes } from '../../app.routes';
import { User, UserRole } from '../../models';
import { UserService } from '../../services/user.service';

describe('Administration workflows', () => {
  const admin: User = {
    id: 'admin', email: 'admin@example.test', displayName: 'Alex Morgan', isActive: true,
    role: UserRole.ADMIN, createdAt: new Date(0), updatedAt: new Date(0),
  };
  const developer: User = { ...admin, id: 'dev', displayName: 'Jamie Park', email: 'jamie@example.test', role: UserRole.DEVELOPER };
  const inactive: User = { ...developer, id: 'inactive', displayName: 'Sam Rivera', email: 'sam@example.test', isActive: false };
  let current: BehaviorSubject<User>;
  let service: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    current = new BehaviorSubject(admin);
    service = jasmine.createSpyObj<UserService>('UserService', ['getCurrentUser', 'getAllUsers', 'hasAnyRole', 'updateUserRole', 'toggleUserStatus']);
    service.getCurrentUser.and.returnValue(current);
    service.getAllUsers.and.returnValue(of([admin, developer, inactive]));
    service.hasAnyRole.and.callFake((roles) => current.pipe(map((user) => roles.includes(user.role))));
    service.updateUserRole.and.resolveTo();
    service.toggleUserStatus.and.resolveTo();
    TestBed.configureTestingModule({
      providers: [
        provideNoopAnimations(),
        provideRouter(routes.filter((route) => route.path?.startsWith('admin/') || route.path === 'unauthorized')),
        { provide: UserService, useValue: service },
      ],
    });
  });

  async function confirm(harness: RouterTestingHarness, action: string): Promise<string> {
    await harness.fixture.whenStable();
    harness.detectChanges();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const text = overlay.textContent ?? '';
    const button = Array.from(overlay.querySelectorAll('button')).find((item) => item.textContent?.trim() === action);
    expect(button).toBeTruthy();
    button?.click();
    await harness.fixture.whenStable();
    harness.detectChanges();
    return text;
  }

  it('keeps both admin routes protected and links the overview to the directory', async () => {
    const harness = await RouterTestingHarness.create('/admin/users');
    expect(harness.routeNativeElement?.querySelector('a[href="/admin/users-table"]')).toBeTruthy();
    await harness.navigateByUrl('/admin/users-table');
    expect(harness.routeNativeElement?.textContent).toContain('All Users');
    current.next(developer);
    for (const path of ['/admin/users', '/admin/users-table']) {
      await harness.navigateByUrl(path);
      await harness.fixture.whenStable();
      expect(TestBed.inject(Router).url).toBe('/unauthorized');
    }
  });

  it('combines name or email search with account status and prevents self role edits', async () => {
    const harness = await RouterTestingHarness.create('/admin/users-table');
    await harness.fixture.whenStable();
    harness.detectChanges();
    const host = harness.routeNativeElement!;
    expect(host.querySelector('select[aria-label="New role for Alex Morgan"]')).toBeNull();
    const search = host.querySelector<HTMLInputElement>('#user-search')!;
    search.value = 'sam@';
    search.dispatchEvent(new Event('input'));
    host.querySelector<HTMLButtonElement>('button[aria-pressed="false"]')!.click();
    harness.detectChanges();
    expect(host.textContent).toContain('No users match');
    Array.from(host.querySelectorAll('button')).find((button) => button.textContent?.trim() === 'Inactive')!.click();
    harness.detectChanges();
    expect(host.querySelector('.directory')?.textContent).toContain('Sam Rivera');
    expect(host.querySelector('.directory')?.textContent).not.toContain('Jamie Park');
    search.value = 'Rivera';
    search.dispatchEvent(new Event('input'));
    harness.detectChanges();
    expect(host.querySelector('.directory')?.textContent).toContain('Sam Rivera');
  });

  it('confirms the proposed role, preserves the current role on failure, and allows retry', async () => {
    const harness = await RouterTestingHarness.create('/admin/users-table');
    await harness.fixture.whenStable();
    harness.detectChanges();
    const host = harness.routeNativeElement!;
    const role = host.querySelector<HTMLSelectElement>('#role-dev')!;
    const update = host.querySelector<HTMLButtonElement>('button[aria-label="Update role for Jamie Park"]')!;
    expect(role.value).toBe(UserRole.DEVELOPER);
    expect(update.disabled).toBeTrue();
    role.value = UserRole.QA_TESTER;
    role.dispatchEvent(new Event('change'));
    harness.detectChanges();
    service.updateUserRole.and.rejectWith(new Error('Denied'));
    update.click();
    const dialog = await confirm(harness, 'Confirm change');
    expect(dialog).toContain('Current role: Developer');
    expect(dialog).toContain('New role: QA Tester');
    expect(role.closest('li')?.textContent).toContain('Current role: Developer');
    expect(role.closest('li')?.querySelector('[role="alert"]')?.textContent).toContain('Could not update role');
    service.updateUserRole.and.resolveTo();
    update.click();
    await confirm(harness, 'Confirm change');
    expect(service.updateUserRole.calls.allArgs()).toEqual([['dev', UserRole.QA_TESTER], ['dev', UserRole.QA_TESTER]]);
    expect(role.closest('li')?.textContent).toContain('Current role: QA Tester');
  });

  it('cancels deactivation and saves each confirmed account status change once', async () => {
    const harness = await RouterTestingHarness.create('/admin/users-table');
    await harness.fixture.whenStable();
    harness.detectChanges();
    const host = harness.routeNativeElement!;
    const button = (name: string) => host.querySelector<HTMLButtonElement>('button[aria-label="' + name + '"]')!;
    button('Deactivate Jamie Park').click();
    await confirm(harness, 'Cancel');
    expect(service.toggleUserStatus).not.toHaveBeenCalled();
    button('Deactivate Jamie Park').click();
    await confirm(harness, 'Deactivate');
    expect(button('Reactivate Jamie Park').closest('li')?.textContent).toContain('Account deactivated.');
    button('Reactivate Jamie Park').click();
    await confirm(harness, 'Reactivate');
    expect(button('Deactivate Jamie Park').closest('li')?.textContent).toContain('Account reactivated.');
    expect(service.toggleUserStatus.calls.allArgs()).toEqual([['dev', false], ['dev', true]]);
  });

  it('blocks repeated status updates while saving and keeps the account active on failure', async () => {
    let reject!: (error: Error) => void;
    service.toggleUserStatus.and.returnValue(new Promise<void>((_resolve, fail) => { reject = fail; }));
    const harness = await RouterTestingHarness.create('/admin/users-table');
    await harness.fixture.whenStable();
    harness.detectChanges();
    const button = harness.routeNativeElement!.querySelector<HTMLButtonElement>('button[aria-label="Deactivate Jamie Park"]')!;
    button.click();
    await confirm(harness, 'Deactivate');
    const row = button.closest('li')!;
    expect(row.getAttribute('aria-busy')).toBe('true');
    expect(button.disabled).toBeTrue();
    button.click();
    expect(service.toggleUserStatus).toHaveBeenCalledOnceWith('dev', false);
    reject(new Error('Permission denied'));
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(row.querySelector('.status-chip')?.textContent).toBe('Active');
    expect(row.querySelector('[role="alert"]')?.textContent).toContain('Could not update account status');
    expect(button.disabled).toBeFalse();
  });
});
