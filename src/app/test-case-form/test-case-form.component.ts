import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map, Observable } from 'rxjs';
import { TEST_CASE_STATUSES, TestCase } from '../models';
import { DuplicateTestCaseIdError, TestCaseService } from '../services/test-case.service';

const defaults = {
  title: '', testCaseId: '', description: '', testType: '' as NonNullable<TestCase['testType']> | '',
  priority: 'medium' as NonNullable<TestCase['priority']>, status: 'Draft' as TestCase['status'],
};

@Component({
  selector: 'app-test-case-form',
  imports: [ReactiveFormsModule, MatButtonModule, MatDialogModule, RouterLink, TitleCasePipe],
  templateUrl: './test-case-form.component.html',
  styleUrls: ['../test-cases/test-case-shell.css', './test-case-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestCaseFormComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TestCaseService);
  private readonly dialog = inject(MatDialog);
  private readonly discard = viewChild<TemplateRef<unknown>>('discard');
  protected readonly editId = signal<string | null>(null);
  protected readonly missing = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveError = signal(false);
  protected readonly types = ['unit', 'integration', 'system', 'acceptance', 'regression', 'smoke'] as const;
  protected readonly priorities = ['low', 'medium', 'high', 'critical'] as const;
  protected readonly statuses = TEST_CASE_STATUSES;
  protected readonly form = new FormGroup({
    title: new FormControl(defaults.title, { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    testCaseId: new FormControl(defaults.testCaseId, { nonNullable: true, validators: [Validators.required, Validators.pattern(/^TC-\d+$/)] }),
    description: new FormControl(defaults.description, { nonNullable: true, validators: [Validators.required, Validators.minLength(10)] }),
    testType: new FormControl(defaults.testType, { nonNullable: true, validators: Validators.required }),
    priority: new FormControl(defaults.priority, { nonNullable: true, validators: Validators.required }),
    status: new FormControl(defaults.status, { nonNullable: true, validators: Validators.required }),
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = params.get('id');
      const record = id ? this.service.getTestCaseById(id) : undefined;
      this.editId.set(id);
      this.missing.set(!!id && !record);
      this.saveError.set(false);
      this.form.reset(record ? {
        title: record.title, testCaseId: record.id, description: record.description ?? '',
        testType: record.testType ?? '', priority: record.priority ?? defaults.priority, status: record.status,
      } : defaults);
      if (id) this.form.controls.testCaseId.disable();
      else this.form.controls.testCaseId.enable();
    });
  }

  protected async save(): Promise<void> {
    if (this.saving() || this.missing()) return;
    this.form.markAllAsTouched();
    const values = this.form.getRawValue();
    if (this.form.invalid || !values.testType) return;

    const id = this.editId();
    const original = id ? this.service.getTestCaseById(id) : undefined;
    const now = new Date();
    const data: TestCase = {
      ...original, id: id ?? values.testCaseId, title: values.title, description: values.description,
      testType: values.testType, priority: values.priority, status: values.status,
      createdAt: id ? original?.createdAt : now, updatedAt: now,
    };

    this.saving.set(true);
    this.saveError.set(false);
    try {
      if (id) this.service.updateTestCase(data);
      else this.service.addTestCase(data);
    } catch (error) {
      if (error instanceof DuplicateTestCaseIdError) this.form.controls.testCaseId.setErrors({ duplicate: true });
      else this.saveError.set(true);
      return;
    } finally {
      this.saving.set(false);
    }
    this.form.markAsPristine();
    await this.router.navigate(['/test-cases'], {
      state: { testCaseFeedback: id ? 'Test case updated.' : 'Test case created.' },
    });
  }

  canLeave(): boolean | Observable<boolean> {
    if (this.form.pristine) return true;
    const template = this.discard();
    if (!template) return false;
    const id = 'discard-test-case';
    const dialog = this.dialog.getDialogById(id) ?? this.dialog.open(template, { id, closeOnNavigation: false });
    return dialog.afterClosed().pipe(map((discard) => discard === true));
  }
}
