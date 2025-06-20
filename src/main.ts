import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app-routing.module';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes)
  ]
}).catch(err => {
  console.error('Bootstrap error:', err);
  // Show a user-friendly error message
  document.body.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
      <div style="text-align: center; padding: 2rem;">
        <h2>⚠️ Application Error</h2>
        <p>Failed to initialize the application. Please refresh the page or try again later.</p>
        <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    </div>
  `;
});
