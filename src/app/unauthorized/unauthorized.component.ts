import { Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  template: `
    <div class="unauthorized-container">
      <div class="error-content">
        <h1>🚫 Access Denied</h1>
        <h2>Unauthorized</h2>
        <p>You don't have permission to access this page.</p>
        <p>Please contact your administrator if you believe this is an error.</p>
        <button routerLink="/" class="back-btn">Back to Home</button>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 20px;
    }

    .error-content {
      text-align: center;
      max-width: 500px;
      padding: 40px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .error-content h1 {
      font-size: 3rem;
      margin: 0 0 10px 0;
    }

    .error-content h2 {
      color: #e74c3c;
      margin: 0 0 20px 0;
    }

    .error-content p {
      color: #7f8c8d;
      margin: 10px 0;
      line-height: 1.6;
    }

    .back-btn {
      background: linear-gradient(135deg, #6c5ce7, #a29bfe);
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      margin-top: 20px;
      transition: all 0.3s ease;
    }

    .back-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(108, 92, 231, 0.3);
    }
  `],
  standalone: false
})
export class UnauthorizedComponent {}
