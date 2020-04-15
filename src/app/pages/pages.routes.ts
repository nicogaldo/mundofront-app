import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { ConsultasComponent } from './consultas/consultas.component';
import { PlacesComponent } from './places/places.component';
import { HorariosComponent } from './horarios/horarios.component';
import { CombosComponent } from './combos/combos.component';
import { ExtrasComponent } from './extras/extras.component';
import { TurnsComponent } from './turns/turns.component';
import { ClientsComponent } from './clients/clients.component';
import { ClientComponent } from './client/client.component';
import { EstadisticasComponent } from './estadisticas/estadisticas.component';

import { ReservasComponent } from './estadisticas/reservas/reservas.component';
import { FinalizadosComponent } from './estadisticas/finalizados/finalizados.component';
import { ContactosComponent } from './estadisticas/contactos/contactos.component';

//import { PagesComponent } from './pages.component';

import { LoginGuard, AdminGuard, VerificaTokenGuard } from '../services/service.index';

const pagesRoutes: Routes = [
	{ 
		path: 'dashboard',
		component: DashboardComponent,
		canActivate: [ VerificaTokenGuard ],
		data: { 'pageTitle': 'Dashboard' } 
	},
	{ path: 'perfil', component: ProfileComponent, canActivate: [ VerificaTokenGuard ], data: { 'pageTitle': 'Perfil' } },
	{ path: 'consultas', component: ConsultasComponent, canActivate: [ VerificaTokenGuard ], data: { 'pageTitle': 'Consultas' } },
	{ path: 'turnos', component: TurnsComponent, canActivate: [ VerificaTokenGuard ], data: { 'pageTitle': 'Turnos' } },
	// restringidas
	{ path: 'estadisticas/contactos', component: ContactosComponent, canActivate: [ AdminGuard ], data: { 'pageTitle': 'Estadísticas Contactos' } },
	{ path: 'estadisticas/reservas', component: ReservasComponent, canActivate: [ AdminGuard ], data: { 'pageTitle': 'Estadísticas Reservas' } },
	{ path: 'estadisticas/finalizados', component: FinalizadosComponent, canActivate: [ AdminGuard ], data: { 'pageTitle': 'Estadísticas Finalizados' } },
	{ path: 'usuarios', component: UsuariosComponent, canActivate: [ AdminGuard ], data: { 'pageTitle': 'Administrar Usuarios' } },
	{ path: 'clientes', component: ClientsComponent, canActivate: [ AdminGuard ], data: { 'pageTitle': 'Administrar Clientes' } },
	{ path: 'cliente/:id', component: ClientComponent, canActivate: [ VerificaTokenGuard ], data: { 'pageTitle': 'Viendo cliente' } },
	{ path: 'lugares', component: PlacesComponent, canActivate: [ AdminGuard ], data: { 'pageTitle': 'Administrar Lugares' } },
	{ path: 'horarios', component: HorariosComponent, canActivate: [ AdminGuard ], data: { 'pageTitle': 'Administrar Horarios' } },
	{ path: 'combos', component: CombosComponent, canActivate: [ AdminGuard ], data: { 'pageTitle': 'Administrar Combos' } },
	{ path: 'extras', component: ExtrasComponent, canActivate: [ AdminGuard ], data: { 'pageTitle': 'Administrar Servicios Extras' } },
	{ path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];

export const PAGES_ROUTES = RouterModule.forChild( pagesRoutes );