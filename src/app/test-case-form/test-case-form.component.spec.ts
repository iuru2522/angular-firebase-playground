import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TestCaseService } from '../services/test-case.service';

import { TestCaseFormComponent } from './test-case-form.component';

describe('TestCaseFormComponent', () => {
  let component: TestCaseFormComponent;
  let fixture: ComponentFixture<TestCaseFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestCaseFormComponent],
      providers: [
        provideRouter([]),
        { provide: TestCaseService, useValue: {} },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestCaseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
