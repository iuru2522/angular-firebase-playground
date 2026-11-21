import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BugService } from '../services/bug.service';

import { FileBugComponent } from './file-bug.component';

describe('FileBugComponent', () => {
  let component: FileBugComponent;
  let fixture: ComponentFixture<FileBugComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileBugComponent],
      providers: [
        provideRouter([]),
        { provide: BugService, useValue: {} },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileBugComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
