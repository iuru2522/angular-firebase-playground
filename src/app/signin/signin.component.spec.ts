import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { SigninComponent } from './signin.component';

describe('SigninComponent', () => {
  it('shows a pending state and announces invalid credentials', async () => {
    const login = new Subject<never>();
    TestBed.configureTestingModule({
      imports: [SigninComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: { login: () => login } }],
    });
    const fixture = TestBed.createComponent(SigninComponent);
    const component = fixture.componentInstance;
    component.signinForm.setValue({ email: 'alex@example.com', password: 'invalid-password' });

    const request = component.onSubmit();
    expect(component.isSubmitting()).toBeTrue();
    login.error({ code: 'auth/invalid-credential' });
    await request;
    fixture.detectChanges();

    expect(component.isSubmitting()).toBeFalse();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent)
      .toContain('Email or password is incorrect');
  });
});
