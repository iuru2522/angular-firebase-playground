import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BugService, Bug } from '../services/bug.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-bug-details',
  imports: [],
  templateUrl: './bug-details.component.html',
  styleUrl: './bug-details.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BugDetailsComponent {

  private route = inject(ActivatedRoute)
  private router = inject(Router);
  private bugService = inject(BugService);


  private bugId = toSignal(
    this.route.params.pipe(map(
      params => params['id'])),
    { initialValue: null }
  );

  bug = computed(() => {
    const id = this.bugId();
    const bugs = this.bugService.bugs();

    return bugs.find(bug => bug.id === id) || null;
  })
   constructor() {
    this.bugService.loadBugs(); 
  }

  goBack(): void {
    this.router.navigate(['bug-list']);
  }

  editBug(): void {
    const currentBug = this.bug()
    if(currentBug){
      this.router.navigate(['/bug-edit',currentBug.id]);
    }
  }

  formatDate(date:Date):string{
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }






}
