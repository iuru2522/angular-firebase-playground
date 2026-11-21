import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AppComponent } from './app.component';
import { authGuard } from './auth.guard';
import { User } from './models/user.interface';
import { UserRole } from './models/user-role.enum';
import { AuthService } from './services/auth.service';
import { FirebaseDiagnosticService } from './services/firebase-diagnostic.service';
import { ThemeService } from './services/theme.service';
import { UserService } from './services/user.service';

@Component({ template: '' })
class TestPage {}

describe('AppComponent shell', () => {
  const account: User = {
    id: 'reporter',
    email: 'alex@example.com',
    displayName: 'Alex Morgan',
    isActive: true,
    role: UserRole.REPORTER,
    createdAt: new Date(0),
    updatedAt: new Date(0),
  };

  let currentUser: BehaviorSubject<User | null>;
  let logout: jasmine.Spy<() => Promise<void>>;
  let originalPreference: string | null;
  let originalTheme: string | null;
  let originalColorScheme: string;

  beforeEach(() => {
    currentUser = new BehaviorSubject<User | null>(null);
    logout = jasmine.createSpy('logout').and.callFake(async () => currentUser.next(null));
    const root = document.documentElement;
    originalPreference = localStorage.getItem('app-theme');
    originalTheme = root.getAttribute('data-theme');
    originalColorScheme = root.style.colorScheme;
    localStorage.setItem('app-theme', 'light');

    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([
          { path: '', component: TestPage },
          { path: 'file-bug', component: TestPage, canActivate: [authGuard] },
          { path: 'settings', component: TestPage, canActivate: [authGuard] },
        ]),
        { provide: UserService, useValue: { getCurrentUser: () => currentUser.asObservable() } },
        { provide: AuthService, useValue: { logout } },
        {
          provide: FirebaseDiagnosticService,
          useValue: { diagnoseFirebase: async () => {}, checkFirestoreRules: async () => {} },
        },
      ],
    });
  });

  afterEach(() => {
    if (originalPreference === null) localStorage.removeItem('app-theme');
    else localStorage.setItem('app-theme', originalPreference);
    const root = document.documentElement;
    if (originalTheme === null) root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', originalTheme);
    root.style.colorScheme = originalColorScheme;
  });

  function render(user: User | null = null): ComponentFixture<AppComponent> {
    currentUser.next(user);
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    tick(3000);
    fixture.detectChanges();
    return fixture;
  }

  it('shows guest access links and persists a theme selected from the toolbar', fakeAsync(() => {
    const fixture = render();
    const host: HTMLElement = fixture.nativeElement;
    const theme = host.querySelector<HTMLButtonElement>('.theme-toggle')!;

    expect(host.querySelector('.app-navigation')).toBeNull();
    expect(host.querySelector('a[href="/signin"]')?.textContent).toContain('Sign In');
    expect(host.querySelector('a[href="/register"]')?.textContent).toContain('Sign Up');
    expect(theme.getAttribute('aria-label')).toBe('Switch to dark mode');

    theme.click();
    fixture.detectChanges();

    expect(TestBed.inject(ThemeService).resolvedTheme()).toBe('dark');
    expect(localStorage.getItem('app-theme')).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
    expect(theme.getAttribute('aria-label')).toBe('Switch to light mode');
  }));

  it('links Create Issue and Settings and marks the active route', fakeAsync(() => {
    const fixture = render(account);
    const host: HTMLElement = fixture.nativeElement;
    const router = TestBed.inject(Router);
    const nav = host.querySelector('nav[aria-label="Main navigation"]')!;

    void router.navigateByUrl('/?view=home');
    tick();
    fixture.detectChanges();
    expect(nav.querySelector('[aria-current="page"]')?.getAttribute('href')).toBe('/');

    nav.querySelector<HTMLAnchorElement>('a[href="/file-bug"]')!.click();
    tick();
    fixture.detectChanges();
    expect(router.url).toBe('/file-bug');
    expect(nav.querySelector('[aria-current="page"]')?.getAttribute('href')).toBe('/file-bug');
    expect(nav.querySelector('a[href="/settings"]')?.textContent).toContain('Settings');
  }));

  it('dismisses the account menu with Escape and restores focus to the avatar', fakeAsync(() => {
    const fixture = render(account);
    const host: HTMLElement = fixture.nativeElement;
    const avatar = host.querySelector<HTMLButtonElement>('button[aria-label="Account menu for Alex Morgan"]')!;
    avatar.focus();
    avatar.click();
    fixture.detectChanges();
    tick(200);

    const menu = document.querySelector<HTMLElement>('[role="menu"]')!;
    expect(menu.textContent).toContain('alex@example.com');
    expect(menu.querySelector('.account-menu__avatar')?.textContent).toBe('AM');
    expect(menu.querySelector('[role="menuitem"]')?.textContent).toContain('Logout');

    const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    Object.defineProperty(escape, 'keyCode', { value: 27 });
    menu.dispatchEvent(escape);
    tick(200);
    fixture.detectChanges();

    expect(avatar.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(avatar);

    avatar.click();
    fixture.detectChanges();
    tick(200);
    document.querySelector<HTMLButtonElement>('button[aria-label="Close account menu"]')!.click();
    tick(200);
    fixture.detectChanges();
    expect(avatar.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(avatar);
  }));

  it('logs out through the menu and redirects subsequent attempts to open Settings', fakeAsync(() => {
    const fixture = render(account);
    const router = TestBed.inject(Router);
    const host: HTMLElement = fixture.nativeElement;
    void router.navigateByUrl('/settings');
    tick();
    fixture.detectChanges();
    expect(router.url).toBe('/settings');

    host.querySelector<HTMLButtonElement>('.account-trigger')!.click();
    fixture.detectChanges();
    tick(200);
    document.querySelector<HTMLButtonElement>('[role="menuitem"]')!.click();
    tick(200);
    fixture.detectChanges();

    expect(logout).toHaveBeenCalledTimes(1);
    expect(router.url).toBe('/');
    expect(host.querySelector('.app-navigation')).toBeNull();

    void router.navigateByUrl('/settings');
    tick();
    expect(router.url).toBe('/');
  }));
});
