import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {
  const email = 'alex@example.com';
  let component: ForgotPasswordComponent;
  let reset: jasmine.Spy<AuthService['sendPasswordResetEmail']>;

  beforeEach(() => {
    reset = jasmine.createSpy<AuthService['sendPasswordResetEmail']>('reset').and.returnValue(of(undefined));
    TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: { sendPasswordResetEmail: reset } }],
    });
    component = TestBed.createComponent(ForgotPasswordComponent).componentInstance;
    component.forgotPasswordForm.controls.email.setValue(email);
  });

  it('acknowledges known and unknown accounts with identical wording', async () => {
    await component.onSubmit();
    const acknowledgement = component.successMessage();
    expect(acknowledgement).toContain('If an account exists');
    expect(reset).toHaveBeenCalledWith(email);

    component.useDifferentEmail();
    component.forgotPasswordForm.controls.email.setValue(email);
    reset.and.returnValue(throwError(() => ({ code: 'auth/user-not-found' })));
    await component.onSubmit();

    expect(component.successMessage()).toBe(acknowledgement);
    expect(component.error()).toBeNull();
  });

  it('keeps the email available for retry after a network failure', async () => {
    reset.and.returnValue(throwError(() => ({ code: 'auth/network-request-failed' })));
    await component.onSubmit();
    expect(component.error()).toContain('try again');
    expect(component.forgotPasswordForm.controls.email.value).toBe(email);
    expect(component.isSubmitting()).toBeFalse();
  });
});
