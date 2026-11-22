import { Injectable, signal } from '@angular/core';
import { TestCase } from '../models';

export class DuplicateTestCaseIdError extends Error {}

@Injectable({
  providedIn: 'root'
})
export class TestCaseService {
  private testCaseSignal = signal<TestCase[]>([]);
  readonly testCases = this.testCaseSignal.asReadonly();

  addTestCase(testCase: TestCase): void {
    if (this.getTestCaseById(testCase.id)) {
      throw new DuplicateTestCaseIdError();
    }
    this.testCaseSignal.update(cases => [...cases, testCase]);
  }

  updateTestCase(updatedTestCase: TestCase): void {
    if (!this.getTestCaseById(updatedTestCase.id)) {
      throw new Error('Test case not found.');
    }
    this.testCaseSignal.update(cases => 
      cases.map(tc => tc.id === updatedTestCase.id ? updatedTestCase : tc)
    );
  }

  deleteTestCase(testCaseId: string) {
    this.testCaseSignal.update(cases => 
      cases.filter(tc => tc.id !== testCaseId)
    );
  }

  getTestCaseById(testCaseId: string): TestCase | undefined {
    return this.testCaseSignal().find(tc => tc.id === testCaseId);
  }

  getAllTestCases() {
    return this.testCaseSignal();
  }
}
