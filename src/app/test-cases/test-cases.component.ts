import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TestCase } from '../models';
import { TestCaseService } from '../services/test-case.service';

@Component({
  selector: 'app-test-cases',
  imports: [],
  templateUrl: './test-cases.component.html',
  styleUrl: './test-cases.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestCasesComponent {
  private router = inject(Router);
  private testCaseService = inject(TestCaseService);

  // testCases = signal<TestCase[]>([
  //   { id: 'TC001', title: 'Login Test', status: 'Draft' }
  // ])

  testCases = this.testCaseService.testCases;

  onAddNew() {
    this.router.navigate(['/test-cases-form']);
  }

}
