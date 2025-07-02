import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';
import { BugService, Bug } from '../services/bug.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bug-list',
  imports: [],
  templateUrl: './bug-list.component.html',
  styleUrl: './bug-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class BugListComponent {

  private router = inject(Router);
  private bugService = inject(BugService);


  isLoading = signal(false);
  searchTerm = signal('');
  selectedSeverity = signal('');
  bugs = toSignal(this.bugService.bugs$, { initialValue: [] });

  constructor() {
    this.loadBugs()
  }

  async loadBugs(): Promise<void>{
    this.isLoading.set(true);
    try{
      await this.bugService.loadBugs();
    }catch (error){
      console.error('Error loading bugs', error);
    } finally{
      this.isLoading.set(false);
    }
  }

  filteredBugs = computed(() => {
    const bugs = this.bugs()
    const search = this.searchTerm().toLowerCase();
    const severity = this.selectedSeverity();

    return bugs.filter(bug => {
      const matchesSearch = bug.title.toLowerCase().includes(search) || bug.description.toLowerCase().includes(search);
      const matchesSeverity = !severity || bug.severity === severity;

      return matchesSearch && matchesSeverity
    })
  })

  updateSearchTerm(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  updateSeverityFilter(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedSeverity.set(target.value);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString();
  }

  viewBug(bugId: string): void{
    this.router.navigate(['/bug-details', bugId]);
  }

  // editBug(bugId: string): void {
  //   this.router.navigate(['/bug-edit',bugId]);
  // }

}
