import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BootstrapContext } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';

const bootstrap = (context?: BootstrapContext) => bootstrapApplication(AppComponent, {
  providers: [
    provideServerRendering(),
    provideClientHydration(),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withFetch())
  ]
}, context);

export default bootstrap;
