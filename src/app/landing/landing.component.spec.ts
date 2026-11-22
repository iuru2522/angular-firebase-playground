import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { BehaviorSubject, map } from 'rxjs';
import { routes } from '../app.routes';
import { User, UserRole, USER_ROLE_LABELS } from '../models';
import { UserService } from '../services/user.service';

@Component({ template: '' })
class ShortcutDestination {}

describe('Workspace routes', () => {
  const currentUser = new BehaviorSubject<User | null>(null);
  const roleCases = [
    { role: UserRole.ADMIN, permission: 'Manage all users and roles', links: ['/admin/users', '/bug-list'] },
    { role: UserRole.PROJECT_MANAGER, permission: 'Assign tasks to team members', links: ['/bug-list'] },
    { role: UserRole.DEVELOPER, permission: 'View assigned tasks', links: ['/bug-list'] },
    { role: UserRole.QA_TESTER, permission: 'Execute test cases', links: ['/test-cases', '/file-bug', '/bug-list'] },
    { role: UserRole.REPORTER, permission: 'View own reported issues', links: ['/file-bug', '/bug-list'] },
  ];

  function signIn(role: UserRole): void {
    currentUser.next({
      id: 'user-id',
      displayName: 'Alex Morgan',
      email: 'alex@example.com',
      isActive: true,
      role,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    });
  }

  beforeEach(() => {
    currentUser.next(null);
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes.map((route) =>
          route.path === '' || route.path === 'require-auth' || !route.component
            ? route
            : { ...route, component: ShortcutDestination },
        )),
        {
          provide: UserService,
          useValue: {
            getCurrentUser: () => currentUser,
            hasAnyRole: (roles: UserRole[]) =>
              currentUser.pipe(map((user) => !!user && roles.includes(user.role))),
          } satisfies Pick<UserService, 'getCurrentUser' | 'hasAnyRole'>,
        },
      ],
    });
  });

  for (const { role, permission, links } of roleCases) {
    it('renders Home and the protected dashboard for ' + role, async () => {
      signIn(role);
      const harness = await RouterTestingHarness.create('/');
      const home = harness.routeNativeElement!;
      expect(home.querySelector('h1')?.textContent).toContain('Welcome back, Alex Morgan');
      expect(home.textContent).toContain(USER_ROLE_LABELS[role]);
      expect(home.textContent).toContain(permission);
      expect(home.querySelectorAll('li').length).toBe(5);
      expect(Array.from(home.querySelectorAll('a'), (link) => link.getAttribute('href'))).toEqual(links);

      await harness.navigateByUrl('/require-auth');
      const dashboard = harness.routeNativeElement!;
      expect(dashboard.querySelector('h1')?.textContent).toBe('Protected Dashboard');
      expect(dashboard.textContent).toContain('alex@example.com');
      expect(dashboard.textContent).toContain(permission);
      expect(Array.from(dashboard.querySelectorAll('a'), (link) => link.getAttribute('href')))
        .toEqual([...links, '/settings']);
    });
  }

  it('keeps the guest homepage and redirects unauthenticated access to protected routes', async () => {
    const harness = await RouterTestingHarness.create('/require-auth');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Welcome to BugTracker');
    await harness.navigateByUrl('/file-bug');
    expect(router.url).toBe('/');
  });

  it('opens a registered shortcut when signed in', async () => {
    signIn(UserRole.REPORTER);
    const harness = await RouterTestingHarness.create('/');
    harness.routeNativeElement!.querySelector<HTMLAnchorElement>('a[href="/file-bug"]')!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/file-bug');
  });

  it('keeps the user management shortcut behind the existing role guard', async () => {
    signIn(UserRole.ADMIN);
    const harness = await RouterTestingHarness.create('/');
    harness.routeNativeElement!.querySelector<HTMLAnchorElement>('a[href="/admin/users"]')!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/admin/users');

    signIn(UserRole.REPORTER);
    await harness.navigateByUrl('/');
    expect(harness.routeNativeElement?.querySelector('a[href="/admin/users"]')).toBeNull();
    await harness.navigateByUrl('/admin/users');
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/unauthorized');
  });
});
