import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';

import { UsuarioService, ConsultaService, ClientService } from '../../services/service.index';
import { Usuario, Consulta, Cliente, Homenajeado } from '../../models/index.model';

import * as moment from 'moment';
moment.locale('es');

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: []
})
export class DashboardComponent implements OnInit {

  totalConsultas: number = 0;
	totalClientes: number = 0;
	turnosProximos: number = 0;
	consultasMes: number = 0;
	turnosMes: number = 0;

	usuario: any = [];

	cargandoDatos: boolean = true;

	now = moment().format('YYYY-MM-DDTHH:mm');
	hoy = moment().format('YYYY-MM-DD');
	mes = moment(this.hoy).month();
	anio = moment().year();

	titulo: string;
	meses = moment.months();
	anios = [ 2019, 2018, 2017 ];

	//selects
	selectMes: number = this.mes;
	selectAnio: number = this.anio;

	public mediosChartLabels:string[] = [];
	public mediosChartData:number[] = [];

	public comoChartLabels:string[] = [];
	public comoChartData:number[] = [];

	public consultasChartLabels:string[] = [];
	public consultasChartData:number[] = [];

	//public asistenciaChartLabels:string[] = [];
	//public asistenciaChartData:number[] = [];

	public doughnutChartType:string = 'doughnut';

  constructor(
		public _usuarioService: UsuarioService,
    public _consultaService: ConsultaService,
    public _clientService: ClientService,
	) {

		this.usuario = this._usuarioService.usuario;
		/*if (this.usuario.role == 'USER_ROLE') {
			this.router.navigate(['/turnos']);
		}*/

	}

  ngOnInit() {
		this.cargarDatos();
		this.cargarDatosMes();
	}

	mesChange( mes ) {
		this.cargarDatosMes( mes, this.selectAnio )
	}

	anioChange( anio ) {
		this.cargarDatosMes( this.selectMes , anio )
	}

	cargarDatos() {

		//pacientes
		this._clientService.cargarTotal()
			.subscribe( (resp: any)=> {
				this.totalClientes = resp.total;
			})

		//consultas
		this._consultaService.cargarTotal()
			.subscribe( (resp: any)=> {
				this.totalConsultas = resp.total;
			})
			
		//proximos turnos
		this._consultaService.cargarTurnos( this.now )
			.subscribe( (resp: any)=> {
				this.turnosProximos = resp.total;
			})

	}

	cargarDatosMes( m = this.mes, a = this.anio ) {

		this.cargandoDatos = true;

		//this.asistenciaChartLabels = [];
		//this.asistenciaChartData = [];
		this.mediosChartLabels = [];
		this.mediosChartData = [];
		this.comoChartLabels = [];
		this.comoChartData = [];
		this.consultasChartLabels = [];
		this.consultasChartData = [];
		this.consultasMes = 0;
		this.turnosMes = 0;
		
		//turnos por rango de fechas
		/*this._consultaService.cargarRango( m, a, 'turnos' )
			.subscribe( (resp: any) => {

				let cArray = resp.consultas;

				//----------  get turnos con asistencia  ----------
				let turnos = cArray.filter(t => t.date_t);
				this.turnosMes = turnos.length;

				// prepare to chart
				let a_count = 0;
				for( let i = 0; i < turnos.length; ++i ) {
					if(turnos[i].asistencia_t == true )
							a_count++;
				}
				let a_diff = turnos.length - a_count;

				this.asistenciaChartLabels = ['Asistidos', 'No asistidos'];
				if (a_count == 0 && a_diff == 0) {
					this.asistenciaChartData = [];
				} else {
					this.asistenciaChartData = [a_count, a_diff];
				}

			});*/

		//consultas por rango de fechas
		this._consultaService.cargarRango( m, a )
			.subscribe( (resp: any) => {

				let cArray = resp.consultas;

				/*----------  get consultas  ----------*/
				let consultas = cArray.filter(c => c.medio_c);
				this.consultasMes = consultas.length;

				// prepare to chart
				let count = 0;
				for (let i = 0; i < consultas.length; ++i) {
					if(consultas[i].date_t != null && consultas[i].medio_c)
							count++;
				}
				let _count = consultas.filter( c => c.medio_c ).length - count;

				this.consultasChartLabels = ['Concretadas', 'No concretadas'];
				if (count == 0 && _count == 0) {
					this.consultasChartData = [];
				} else {
					this.consultasChartData = [count, _count];
				}

				/*----------  get medios de contacto  ----------*/
				let medios = cArray.filter(c => c.medio_c !== undefined && c.medio_c !== null).map(c => c.medio_c);
				let finalMedios = medios.reduce((b,c)=>((b[b.findIndex(d=>d.medios===c)]||b[b.push({medios:c,count:0})-1]).count++,b),[]);
				// prepare to chart
				this.mediosChartLabels = finalMedios.map(m => m.medios);
				this.mediosChartData = finalMedios.map(m => m.count);

				/*----------  get como nos conocio  ----------*/
				let como = cArray.filter(c => c.como_c !== undefined && c.como_c !== null).map(c => c.como_c);
				let finalComo = como.reduce((b,c)=>((b[b.findIndex(d=>d.como===c)]||b[b.push({como:c,count:0})-1]).count++,b),[]);
				// prepare to chart
				this.comoChartLabels = finalComo.map(m => m.como);
				this.comoChartData = finalComo.map(m => m.count);

				this.cargandoDatos = false;
			})

	}
  
}
