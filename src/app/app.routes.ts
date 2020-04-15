import { RouterModule, Routes } from '@angular/router';

import { PagesComponent } from './pages/pages.component';
import { LoginComponent } from './login/login.component';
import { NopagefoundComponent } from './shared/nopagefound/nopagefound.component';
import { LoginGuard } from './services/guards/login.guard';

const appRoutes: Routes = [
	{ path: 'ingresar', component: LoginComponent, data: { 'pageTitle': 'Ingresar' } },

	{
		path: '',
		component: PagesComponent,
		canActivate: [ LoginGuard ],
		loadChildren: './pages/pages.module#PagesModule'
	},

	{ path: '**', component: NopagefoundComponent }
];

export const APP_ROUTES = RouterModule.forRoot( appRoutes, { useHash: true, anchorScrolling: 'enabled' } );