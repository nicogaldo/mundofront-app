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
	turnosHoy: Consulta[] = [];
	cargandoH: boolean = false;

	usuario: any = [];

	cargandoDatos: boolean = true;

	now = moment.utc().format();
	hoy = moment.utc().format('YYYY-MM-DD');
	mes = moment.utc(this.hoy).month();
	anio = moment.utc().year();

	titulo: string;
	meses = moment.months();
	anios = [ 2020, 2019, 2018, 2017 ];

	//selects
	selectMes: number = this.mes;
	selectAnio: number = this.anio;
	fromDate: any = moment.utc([this.selectAnio, this.selectMes]).startOf('month').format();
	toDate: any = moment.utc([this.selectAnio, this.selectMes]).endOf('month').format();

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
		this.cargarDatosHoy();
		this.cargarDatosMes();
	}

	mesChange( mes ) {
		this.selectMes = mes;
		this.fromDate = moment.utc([this.selectAnio, this.selectMes]).startOf('month').format();
		this.toDate = moment.utc([this.selectAnio, this.selectMes]).endOf('month').format();
		this.cargarDatosMes( mes, this.selectAnio );
	}

	anioChange( anio ) {
		this.selectAnio = anio;
		this.fromDate = moment.utc([this.selectAnio, this.selectMes]).startOf('month').format();
		this.toDate = moment.utc([this.selectAnio, this.selectMes]).endOf('month').format();
		this.cargarDatosMes( this.selectMes , anio );
	}

	cargarDatos() {

		//pacientes
		/*this._clientService.cargarTotal()
			.subscribe( (resp: any)=> {
				this.totalClientes = resp.total;
			})*/

		//consultas
		/*this._consultaService.cargarTotal()
			.subscribe( (resp: any)=> {
				this.totalConsultas = resp.total;
			})*/
			
		//proximos turnos
		/*this._consultaService.cargarRango( this.selectMes, this.selectAnio, 'turnos' )
			.subscribe( (resp: any)=> {
				console.log(resp.consultas);
				let turnos = resp.consultas.filter(t => moment.utc(t.date_t).format() > this.now && moment.utc(t.date_t).format() <= this.toDate);
				console.log('turnos');
				console.log(turnos);

				this.turnosProximos = turnos.length;
			})*/

	}

	cargarDatosHoy() {

		let f = this.hoy.split('-');
		let fecha = {
			year: f[0],
			month: f[1],
			day: f[2]
		}
		this.cargandoH = true;
		this._consultaService.cargarTurnosFecha( fecha )
			.subscribe( (resp: any) => {
				this.turnosHoy = resp.consultas.filter(c => c.status === 'RESERVADO' && moment.utc(c.date_t).format('YYYY-MM-DD') === this.hoy);
				this.cargandoH = false;
			})
	}

	cargarDatosMes( m = this.selectMes, a = this.selectAnio ) {

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
		
		//consultas por rango de fechas
		this._consultaService.cargarTurnosRango( this.fromDate, this.toDate )
			.subscribe( (resp: any) => {
				let turnos = resp.turnos;

				/*----------  get prox turnos  ----------*/
				//let turnos = cArray.filter(t => t.date_t > this.now && t.date_t <= this.toDate);
				//console.log('turnos');
				//console.log(turnos);

				this.turnosProximos = turnos.length;
			})
		
		//this._consultaService.cargarRango( m, a )
		this._consultaService.cargarRango( this.fromDate, this.toDate )
			.subscribe( (resp: any) => {

				let cArray = resp.consultas;

				/*----------  get clientes  ----------*/
				let clientes = cArray.filter(c => c.status === 'RESERVADO' || c.status === 'FINALIZADO' && c.client_c && (c.client_c.createdAt >= this.fromDate && c.client_c.createdAt <= this.toDate));
				this.totalClientes = clientes.length;

				/*----------  get consultas  ----------*/
				let consultas = cArray.filter(c => c.medio_c);
				console.log('consultas', consultas);
				this.consultasMes = consultas.length;

				// prepare to chart
				let count = 0;
				for (let i = 0; i < consultas.length; ++i) {
					if(consultas[i].date_t != null && consultas[i].medio_c)
							count++;
				}
				let _count = consultas.filter( c => c.medio_c ).length - count;

				this.consultasChartLabels = ['Reservas', 'Contactos'];
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
