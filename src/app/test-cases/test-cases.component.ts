import { DatePipe, NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink } from '@angular/router';
import { TestCase } from '../models';
import { TestCaseService } from '../services/test-case.service';

@Component({
  selector: 'app-test-cases',
  imports: [DatePipe, NgTemplateOutlet, TitleCasePipe, MatButtonModule, MatDialogModule, MatMenuModule, RouterLink],
  templateUrl: './test-cases.component.html',
  styleUrls: ['./test-case-shell.css', './test-cases.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestCasesComponent {
  private readonly service = inject(TestCaseService);
  private readonly dialog = inject(MatDialog);
  protected readonly testCases = this.service.testCases;
  protected readonly feedback = inject(Router).currentNavigation()?.extras.state?.['testCaseFeedback'] as string | undefined;

  protected confirmDelete(template: TemplateRef<{ $implicit: TestCase }>, testCase: TestCase): void {
    const dialog = this.dialog.open<{ $implicit: TestCase }, TestCase, boolean>(template, {
      data: testCase,
      width: '28rem',
    });
    dialog.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.service.deleteTestCase(testCase.id);
    });
  }
}
