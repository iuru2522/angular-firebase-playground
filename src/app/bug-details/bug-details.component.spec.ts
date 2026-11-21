import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BugService } from '../services/bug.service';

import { BugDetailsComponent } from './bug-details.component';

describe('BugDetailsComponent', () => {
  let component: BugDetailsComponent;
  let fixture: ComponentFixture<BugDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BugDetailsComponent],
      providers: [
        provideRouter([]),
        { provide: BugService, useValue: { bugs: () => [], loadBugs: () => {} } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(BugDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
