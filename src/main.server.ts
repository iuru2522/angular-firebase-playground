import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app-routing.module';
import { provideClientHydration } from '@angular/platform-browser';

const bootstrap = () => bootstrapApplication(AppComponent, {
  providers: [
    provideServerRendering(),
    provideClientHydration(),
    provideRouter(routes),
 
  ]
});

export default bootstrap;
