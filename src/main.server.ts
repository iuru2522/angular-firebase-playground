import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, RenderMode, withRoutes } from '@angular/ssr';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { clientAuthPaths } from './app/client-auth-paths';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BootstrapContext } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';

// Firebase restores the session in the browser. Rendering guarded routes on
// the server would redirect signed-in users before their session is available.
const serverRoutes = clientAuthPaths.map((path) => ({ path, renderMode: RenderMode.Client as const }));

const bootstrap = (context?: BootstrapContext) => bootstrapApplication(AppComponent, {
  providers: [
    provideServerRendering(withRoutes([...serverRoutes, { path: '**', renderMode: RenderMode.Server }])),
    provideClientHydration(),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withFetch())
  ]
}, context);

export default bootstrap;
