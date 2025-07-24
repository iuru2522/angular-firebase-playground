import { Directive, TemplateRef, ViewContainerRef, OnInit, OnDestroy, input, effect } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../services/user.service';
import { UserRole } from '../models';

@Directive({
  selector: '[hasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  hasRole = input<UserRole | UserRole[]>([]);

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private userService: UserService
  ) {
    effect(() => {
      this.updateView();
    });
  }

  ngOnInit() {
    this.updateView();
  }

  private updateView() {
    const roles = this.hasRole();
    if (!roles || (Array.isArray(roles) && roles.length === 0)) {
      return;
    }

    const roleArray = Array.isArray(roles) ? roles : [roles];
    
    this.userService.hasAnyRole(roleArray).pipe(
      takeUntil(this.destroy$)
    ).subscribe(hasRole => {
      this.viewContainer.clear();
      if (hasRole) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
