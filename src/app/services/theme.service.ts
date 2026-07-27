import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private mediaQuery: MediaQueryList | null = null;
  private readonly onSystemChange = (): void => this.syncResolvedTheme();

  private readonly preferenceSignal = signal<ThemePreference>(this.readStoredPreference());
  private readonly resolvedThemeSignal = signal<ResolvedTheme>('dark');

  readonly preference = this.preferenceSignal.asReadonly();
  readonly resolvedTheme = this.resolvedThemeSignal.asReadonly();
  readonly isDark = computed(() => this.resolvedTheme() === 'dark');

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQuery.addEventListener('change', this.onSystemChange);
    this.syncResolvedTheme();
  }

  setPreference(preference: ThemePreference): void {
    this.preferenceSignal.set(preference);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (preference === 'system') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, preference);
    }

    this.syncResolvedTheme();
  }

  toggleLightDark(): void {
    const next: ResolvedTheme = this.resolvedTheme() === 'dark' ? 'light' : 'dark';
    this.setPreference(next);
  }

  private readStoredPreference(): ThemePreference {
    if (!isPlatformBrowser(this.platformId)) {
      return 'system';
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }

    return 'system';
  }

  private syncResolvedTheme(): void {
    const preference = this.preferenceSignal();
    const resolved = preference === 'system' ? this.systemTheme() : preference;
    this.resolvedThemeSignal.set(resolved);
    this.applyToDocument(resolved);
  }

  private systemTheme(): ResolvedTheme {
    if (!isPlatformBrowser(this.platformId) || !this.mediaQuery) {
      return 'dark';
    }
    return this.mediaQuery.matches ? 'dark' : 'light';
  }

  private applyToDocument(theme: ResolvedTheme): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const root = document.documentElement;
    root.dataset['theme'] = theme;
    root.style.colorScheme = theme;
  }
}
