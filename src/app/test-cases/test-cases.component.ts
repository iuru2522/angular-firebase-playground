import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TestCase } from '../models';
import { TestCaseService } from '../services/test-case.service';

@Component({
  selector: 'app-test-cases',
  imports: [CommonModule],
  templateUrl: './test-cases.component.html',
  styleUrl: './test-cases.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestCasesComponent {
  private router = inject(Router);
  private testCaseService = inject(TestCaseService);

  testCases = this.testCaseService.testCases;

  onAddNew() {
    this.router.navigate(['/test-cases-form']);
  }

  onView(testCase: TestCase) {
    this.router.navigate(['/test-cases', testCase.id]);
  }

  onEdit(testCase: TestCase){
    this.router.navigate(['/test-cases-form', testCase.id]);
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase()}`;
  }

   onDelete(testCaseId: string) {
    if (confirm('Are you sure you want to delete this test case?')) {
      this.testCaseService.deleteTestCase(testCaseId);
    }
  }

}
