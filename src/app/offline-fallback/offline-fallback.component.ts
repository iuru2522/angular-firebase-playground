import { MatButtonModule } from '@angular/material/button';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-offline-fallback',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  templateUrl: './offline-fallback.component.html'
})
export class OfflineFallbackComponent {
  retry(): void {
    window.location.reload();
  }
} 