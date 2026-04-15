import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { MainPageComponent } from './Pages/main-page';
import { routes } from './app.routes';

@NgModule({
  declarations: [
    // ...otros componentes no-standalone...
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    AppComponent, // Importa el standalone component aquí
    MainPageComponent
  ],
  providers: [],
  // Elimina la propiedad bootstrap si usas bootstrapApplication en main.ts,
  // o mantenla solo si sigues usando NgModule bootstrap (no recomendado con standalone)
})
export class AppModule {}
