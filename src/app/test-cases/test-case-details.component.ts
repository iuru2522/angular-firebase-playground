import { DatePipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TestCaseService } from '../services/test-case.service';

@Component({
  selector: 'app-test-case-details',
  imports: [DatePipe, TitleCasePipe, MatButtonModule, RouterLink],
  styleUrls: ['./test-case-shell.css'],
  template: `
    <section class="test-page">
      @if (testCase(); as record) {
        <header class="test-header">
          <div><p>Test Cases / {{ record.id }}</p><h1>{{ record.title }}</h1></div>
          <div class="test-actions">
            <a mat-stroked-button routerLink="/test-cases">Back to test cases</a>
            <a mat-flat-button [routerLink]="['/test-cases-form', record.id]">Edit test case</a>
          </div>
        </header>
        <article class="test-panel">
          <h2>Description</h2>
          <p class="test-description">{{ record.description || 'No description provided.' }}</p>
          <dl class="test-metadata">
            <div><dt>Type</dt><dd>{{ (record.testType | titlecase) || 'Not set' }}</dd></div>
            <div><dt>Priority</dt><dd>{{ (record.priority | titlecase) || 'Not set' }}</dd></div>
            <div><dt>Status</dt><dd>{{ record.status | titlecase }}</dd></div>
            <div><dt>Created</dt><dd>{{ (record.createdAt | date:'medium') || 'Not set' }}</dd></div>
            <div><dt>Last updated</dt><dd>{{ (record.updatedAt | date:'medium') || 'Not set' }}</dd></div>
          </dl>
        </article>
      } @else {
        <div class="test-panel">
          <h1>Test case not found</h1>
          <p>This test case is unavailable in the current app session.</p>
          <a mat-flat-button routerLink="/test-cases">Back to test cases</a>
        </div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestCaseDetailsComponent {
  private readonly service = inject(TestCaseService);
  private readonly params = toSignal(inject(ActivatedRoute).paramMap, { requireSync: true });
  protected readonly testCase = computed(() => this.service.getTestCaseById(this.params().get('id') ?? ''));
}
