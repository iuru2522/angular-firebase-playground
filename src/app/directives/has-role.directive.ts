import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../services/user.service';
import { UserRole } from '../models';

@Directive({
  selector: '[hasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private _hasRole: UserRole | UserRole[] = [];
  
  @Input() set hasRole(roles: UserRole | UserRole[]) {
    this._hasRole = roles;
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.updateView();
  }

  private updateView() {
    if (!this._hasRole) {
      return;
    }

    const roles = Array.isArray(this._hasRole) ? this._hasRole : [this._hasRole];
    
    this.userService.hasAnyRole(roles).pipe(
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
