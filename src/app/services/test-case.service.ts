import { Injectable, signal } from '@angular/core';
import { TestCase } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TestCaseService {

  private testCaseSignal = signal<TestCase[]>([]);
  readonly testCases = this.testCaseSignal.asReadonly()

  // constructor() { }

  addTestCase(testCase: TestCase) {
    this.testCaseSignal.update(cases => [...cases, testCase]);
  }

  getAllTestCases(){
    return this.testCaseSignal();
  }
}
