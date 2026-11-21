import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { UserService } from '../services/user.service';

import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [
        provideRouter([]),
        {
          provide: UserService,
          useValue: {
            getCurrentUser: () => of(null),
            hasRole: () => of(false),
          } satisfies Pick<UserService, 'getCurrentUser' | 'hasRole'>,
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
