import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TestCaseService } from '../services/test-case.service';
import { TestCase } from '../models';

@Component({
  selector: 'app-test-case-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './test-case-form.component.html',
  styleUrl: './test-case-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestCaseFormComponent {
  private router = inject(Router);
  private testCaseService = inject(TestCaseService);
  private fb = inject(FormBuilder);

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  testCaseForm: FormGroup;

  testTypeOptions = [
    { value: 'unit', label: 'Unit' },
    { value: 'integration', label: 'Integration' },
    { value: 'system', label: 'System' },
    { value: 'acceptance', label: 'Acceptance' },
    { value: 'regression', label: 'Regression' },
    { value: 'smoke', label: 'Smoke' }
  ];

  priorityOptions = [
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'ready', label: 'Ready' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'passed', label: 'Passed' },
    { value: 'failed', label: 'Failed' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'skipped', label: 'Skipped' }
  ];

  constructor() {
    this.testCaseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      testCaseId: ['', [Validators.required, Validators.pattern(/^TC-\d+$/)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      testType: ['', Validators.required],
      priority: ['medium', Validators.required],
      status: ['draft', Validators.required]
    });
  }

  readonly isFormValid = computed(() => this.testCaseForm.valid && !this.isSubmitting());

  async onSave(): Promise<void> {
    if (!this.testCaseForm.valid || this.isSubmitting()) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);
    this.successMessage.set(null);

    try {
      const formData = this.testCaseForm.getRawValue();
      const newTestCase: TestCase = {
        id: formData.testCaseId,
        title: formData.title,
        status: formData.status,
        description: formData.description,
        testType: formData.testType,
        priority: formData.priority,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.testCaseService.addTestCase(newTestCase);
      this.successMessage.set('Test case created successfully!');

      this.testCaseForm.reset({
        title: '',
        testCaseId: '',
        description: '', // Fixed typo: was 'desciption'
        testType: '',
        priority: 'medium',
        status: 'draft'
      });

      setTimeout(() => {
        this.router.navigate(['/test-cases']); // Fixed route: was '/test-case'
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create test case';
      this.error.set(errorMessage);
      console.error('Error creating test case:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onBack(): void {
    this.router.navigate(['/test-cases']);
  }

  onCancel(): void {
    if (this.testCaseForm.dirty && !confirm('You have unsaved changes. Are you sure you want to cancel?')) {
      return;
    }
    this.router.navigate(['/test-cases']);
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.testCaseForm.controls).forEach(key => {
      this.testCaseForm.get(key)?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.testCaseForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['pattern']) return `${fieldName} must follow the format TC-123`;
    }
    return null;
  }
}
