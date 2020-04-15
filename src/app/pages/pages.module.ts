import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PAGES_ROUTES } from './pages.routes';
import { SharedModule } from '../shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

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
import { ExtrasComponent } from './extras/extras.component';

import { EstadisticasComponent } from './estadisticas/estadisticas.component';
import { ReservasComponent } from './estadisticas/reservas/reservas.component';
import { ContactosComponent } from './estadisticas/contactos/contactos.component';
import { FinalizadosComponent } from './estadisticas/finalizados/finalizados.component';
import { CajaComponent } from './caja/caja.component';
import { PaymentsComponent } from './payments/payments.component';

// plugins
import { MomentModule } from 'ngx-moment';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { CountUpModule } from 'countup.js-angular2';
import { ChartsModule } from 'ng2-charts';
import { DataTablesModule } from 'angular-datatables';

import localeEs from '@angular/common/locales/es';
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
			ReservasComponent,
			ContactosComponent,
			FinalizadosComponent,
			CajaComponent,
			PaymentsComponent,
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
			NgbModule,
		]
    
})
export class PagesModule { }