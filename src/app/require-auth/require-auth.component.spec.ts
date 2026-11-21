import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NEVER } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

import { RequireAuthComponent } from './require-auth.component';

describe('RequireAuthComponent', () => {
  let component: RequireAuthComponent;
  let fixture: ComponentFixture<RequireAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequireAuthComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: {} },
        { provide: UserService, useValue: { getCurrentUser: () => NEVER } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequireAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
