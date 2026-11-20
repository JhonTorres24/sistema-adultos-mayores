import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { AdultosComponent } from './components/adultos/adultos';
import { RegistroComponent } from './components/registro/registro'; // Importación

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent }, // La ruta que debe cargar
  { path: 'dashboard', component: DashboardComponent },
  { path: 'adultos', component: AdultosComponent },
  { path: '**', redirectTo: 'login' }
];