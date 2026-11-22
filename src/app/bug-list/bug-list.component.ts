import { DatePipe, TitleCasePipe, ViewportScroller } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, Injector, OnDestroy, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Bug, BugService } from '../services/bug.service';
import { BugListState } from './bug-list-state';

@Component({
  selector: 'app-bug-list',
  imports: [DatePipe, TitleCasePipe, MatButtonModule, RouterLink],
  templateUrl: './bug-list.component.html',
  styleUrl: './bug-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BugListComponent implements OnDestroy {
  private readonly bugService = inject(BugService);
  private readonly viewport = inject(ViewportScroller);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  protected readonly state = inject(BugListState);
  protected readonly bugs = toSignal(this.bugService.bugs$, { initialValue: [] });
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly feedback = this.router.currentNavigation()?.extras.state?.['bugReportFeedback'] as string | undefined;
  protected readonly hasFilters = computed(() => !!(this.state.search().trim() || this.state.severity()));
  protected readonly filteredBugs = computed(() => {
    const search = this.state.search().trim().toLowerCase().replace(/^#/, '');
    const severity = this.state.severity();
    return this.bugs().filter((bug) =>
      (!severity || bug.severity === severity) &&
      [bug.id, bug.title, bug.description].some((value) => value.toLowerCase().includes(search)),
    );
  });

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(false);
    try {
      await this.bugService.loadBugs();
      if (!this.destroyRef.destroyed) {
        afterNextRender(() => this.viewport.scrollToPosition(this.state.position), { injector: this.injector });
      }
    } catch {
      this.loadError.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  protected setSeverity(event: Event): void {
    this.state.severity.set((event.target as HTMLSelectElement).value as Bug['severity'] | '');
  }

  protected clearFilters(): void {
    this.state.search.set('');
    this.state.severity.set('');
  }

  ngOnDestroy(): void {
    if (!this.loading() && !this.loadError()) this.state.position = this.viewport.getScrollPosition();
  }
}
