import { ViewportScroller } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map, Observable } from 'rxjs';
import { Bug, BugService } from '../services/bug.service';

@Component({
  selector: 'app-file-bug',
  imports: [ReactiveFormsModule, MatButtonModule, MatDialogModule, RouterLink],
  templateUrl: './file-bug.component.html',
  styleUrls: ['../bug-list/bug-reports.css', './file-bug.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileBugComponent {
  private readonly dialog = inject(MatDialog);
  private readonly discardDialog = viewChild<TemplateRef<unknown>>('discardDialog');
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(BugService);
  private readonly viewport = inject(ViewportScroller);
  private request = 0;
  protected readonly bugId = signal<string | null>(null);
  protected readonly editing = computed(() => this.bugId() !== null);
  protected readonly loadState = signal<'ready' | 'loading' | 'missing' | 'error'>('ready');
  protected readonly submitting = signal(false);
  protected readonly saveError = signal(false);
  protected readonly submitted = signal(false);
  protected readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10)] }),
    severity: new FormControl<Bug['severity']>('low', { nonNullable: true, validators: Validators.required }),
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.bugId.set(params.get('id'));
      void this.load();
    });
    afterNextRender(() => this.viewport.scrollToPosition([0, 0]));
  }

  protected async load(): Promise<void> {
    const request = ++this.request;
    const id = this.bugId();
    if (!id) return;
    this.loadState.set('loading');
    try {
      const bug = await this.service.getBugById(id);
      if (request !== this.request) return;
      if (!bug) {
        this.loadState.set('missing');
        return;
      }
      this.form.reset({ title: bug.title, description: bug.description, severity: bug.severity });
      this.submitted.set(false);
      this.saveError.set(false);
      this.loadState.set('ready');
    } catch {
      if (request === this.request) this.loadState.set('error');
    }
  }

  protected async submit(): Promise<void> {
    if (this.submitting() || this.loadState() !== 'ready') return;
    this.submitted.set(true);
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.saveError.set(false);
    const id = this.bugId();
    try {
      const data = this.form.getRawValue();
      if (id) await this.service.updateBug(id, data);
      else await this.service.submitBug(data);
    } catch {
      this.saveError.set(true);
      return;
    } finally {
      this.submitting.set(false);
    }
    this.form.markAsPristine();
    await this.router.navigate(['/bug-list'], {
      state: { bugReportFeedback: id ? 'Bug report updated.' : 'Bug report filed.' },
    });
  }

  canLeave(): boolean | Observable<boolean> {
    if (this.submitting()) return false;
    if (this.form.pristine) return true;
    const template = this.discardDialog();
    if (!template) return false;
    const dialogId = 'discard-bug-report';
    const dialog = this.dialog.getDialogById(dialogId) ?? this.dialog.open<unknown, unknown, boolean>(template, {
      id: dialogId,
      width: '28rem',
      autoFocus: 'first-tabbable',
      closeOnNavigation: false,
    });
    return dialog.afterClosed().pipe(map((discard) => discard === true));
  }
}
