import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, Validator, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { BugService } from '../services/bug.service';



interface BugReportForm {
  title: FormControl<string>,
  description: FormControl<string>,
  severity: FormControl<'low' | 'medium' | 'high' | 'critical'>;

}

@Component({
  selector: 'app-file-bug',
  imports: [ReactiveFormsModule],
  templateUrl: './file-bug.component.html',
  styleUrl: './file-bug.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileBugComponent {

  private router = inject(Router);
  private bugService = inject(BugService);

  isSubmitting = signal(false);

  bugForm = new FormGroup<BugReportForm>({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)]
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10)]
    }),
    severity: new FormControl<'low' | 'medium' | 'high' | 'critical'>('medium', {
      nonNullable: true,
      validators: [Validators.required]
    })
  })

  async onSubmit(): Promise<void> {
    if (this.bugForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);


      try {

        const bugReportData = this.bugForm.getRawValue();
        await this.bugService.submitBug(bugReportData);

        this.bugForm.reset({
          title: '',
          description: '',
          severity: 'medium'
        })

        alert('Bug report submitted successfully!');
        this.router.navigate(['/bug-list']);


      } catch (error) {
        console.log('Eror submitting bug:', error);
        alert('Failed to submit but report. Please try again');

      } finally {
        this.isSubmitting.set(false);
      }
    }



  }

  onCancel(): void {
    this.router.navigate(['./dashboard']);
  }

}
