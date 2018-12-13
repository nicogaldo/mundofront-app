import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PAGES_ROUTES } from './pages.routes';
import { SharedModule } from '../shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';

// pages
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { ClientsComponent } from './clients/clients.component';
import { ConsultasComponent } from './consultas/consultas.component';
import { PlacesComponent } from './places/places.component';
import { CombosComponent } from './combos/combos.component';
import { TurnsComponent } from './turns/turns.component';
import { HorariosComponent } from './horarios/horarios.component';
import { ClientComponent } from './client/client.component';
import { EstadisticasComponent } from './estadisticas/estadisticas.component';

// plugins
import { MomentModule } from 'angular2-moment';
import { FullCalendarModule } from 'ng-fullcalendar';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { CountUpModule } from 'countup.js-angular2';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { DataTablesModule } from 'angular-datatables';

import localeEs from '@angular/common/locales/es';
import { ExtrasComponent } from './extras/extras.component';
registerLocaleData(localeEs);

@NgModule({
		declarations: [
			DashboardComponent,
			UsuariosComponent,
			ProfileComponent,
			ConsultasComponent,
			PlacesComponent,
			CombosComponent,
			TurnsComponent,
			ClientsComponent,
			HorariosComponent,
			ClientComponent,
			EstadisticasComponent,
			ExtrasComponent,
		],
		exports: [
			DashboardComponent,
		],
		imports: [
			CommonModule,
			FormsModule,
			ReactiveFormsModule,
			NgSelectModule,
			SharedModule,
			PAGES_ROUTES,
			PipesModule,
			MomentModule,
			FullCalendarModule,
			NgxSmartModalModule.forRoot(),
			NgxMaterialTimepickerModule.forRoot(),
			CountUpModule,
			ChartsModule,
			DataTablesModule,
		]
    
})
export class PagesModule { }