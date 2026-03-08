import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, Validator, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
export class FileBugComponent implements OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private bugService = inject(BugService);

  isSubmitting = signal(false);
  isEditMode = signal(false);
  bugId = signal<string | null>(null);

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

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.bugId.set(id);
      this.isEditMode.set(true);
      this.loadBugData(id);
    }
  }

  private async loadBugData(bugId: string): Promise<void> {
    try {
      const bug = await this.bugService.getBugById(bugId);
      if (bug) {
        this.bugForm.patchValue({
          title: bug.title,
          description: bug.description,
          severity: bug.severity
        });
      }
    } catch (error) {
      console.error('Error loading bug data:', error);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.bugForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);


      try {

        const bugReportData = this.bugForm.getRawValue();

        if (this.isEditMode() && this.bugId()) {
          await this.bugService.updateBug(this.bugId()!, bugReportData);
          alert('Bug report updated successfully!');
        } else {
          await this.bugService.submitBug(bugReportData);
          alert('Bug report submitted successfully!');
        }

        this.bugForm.reset({
          title: '',
          description: '',
          severity: 'medium'
        })

        this.router.navigate(['/bug-list']);


      } catch (error) {
        console.log('Error submitting bug:', error);
        alert('Failed to submit bug report. Please try again');

      } finally {
        this.isSubmitting.set(false);
      }
    }



  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }

}
