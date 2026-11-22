import { DatePipe, TitleCasePipe, ViewportScroller } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Bug, BugService } from '../services/bug.service';

@Component({
  selector: 'app-bug-details',
  imports: [DatePipe, TitleCasePipe, MatButtonModule, RouterLink],
  templateUrl: './bug-details.component.html',
  styleUrls: ['../bug-list/bug-reports.css', './bug-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BugDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(BugService);
  private readonly viewport = inject(ViewportScroller);
  private request = 0;
  protected readonly result = signal<
    { status: 'loading' | 'missing' | 'error' } | { status: 'ready'; bug: Bug }
  >({ status: 'loading' });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(() => void this.load());
    afterNextRender(() => this.viewport.scrollToPosition([0, 0]));
  }

  protected async load(): Promise<void> {
    const request = ++this.request;
    const id = this.route.snapshot.paramMap.get('id');
    this.result.set({ status: 'loading' });
    try {
      const bug = id ? await this.service.getBugById(id) : null;
      if (request === this.request) {
        this.result.set(bug ? { status: 'ready', bug } : { status: 'missing' });
      }
    } catch {
      if (request === this.request) this.result.set({ status: 'error' });
    }
  }
}
