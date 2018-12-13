import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';

import { UsuarioService, ConsultaService, PlaceService } from '../../services/service.index';
import { Usuario, Consulta, Place } from '../../models/index.model';

import * as moment from 'moment';
moment.locale('es');

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css']
})
export class EstadisticasComponent implements OnInit {

  usuario: Usuario;

  places: Place[] = [];
  cargandoP: boolean = false;
  consultas: Consulta[] = [];
  cargandoC: boolean = false;
  c_filtro: any = [];
  cargandoF: boolean = false;

	now = moment().format('YYYY-MM-DDTHH:mm');
	hoy = moment().format('YYYY-MM-DD');
	mes = moment(this.hoy).month();
	//mes = moment(this.hoy).subtract(1,'months').month();
	anio = moment().year();

	titulo: string;
	meses = moment.months();
	anios = [ 2019, 2018, 2017 ];

	//selects
	selectMes: number = this.mes;
	selectAnio: number = this.anio;

	//dtOptions: DataTables.Settings = {};
	dtOptions: any = {};


	public consultasChartLabels:string[] = [];
	public consultasChartData:number[] = [];
	public doughnutChartType:string = 'line';

  constructor(
		public _usuarioService: UsuarioService,
    public _consultaService: ConsultaService,
    public _placeService: PlaceService,
  ) { }

  ngOnInit() {
		this.cargarDatosMes();
		this.cargarLugares();

		this.dtOptions = {
			language: {
		    url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/Spanish.json"
		  } ,
			dom: 'Blfrtip',
 			buttons: [
        {
        	extend: 'excelHtml5',
	        text: '<i class="far fa-file-excel"></i>',
	        titleAttr: 'Exportar Excel',
        },
        {
        	extend: 'print',
	        text: '<i class="fas fa-print"></i>',
	        titleAttr: 'Imprimir',
	        //columns: ':not(.select-checkbox)',
	        //orientation: 'landscape',
	        customize: function(win) {
            var last = null;
            var current = null;
            var bod = [];

            var css = '@page { size: landscape; }',
                head = win.document.head || win.document.getElementsByTagName('head')[0],
                style = win.document.createElement('style');

            style.type = 'text/css';
            style.media = 'print';

            if (style.styleSheet) {
              style.styleSheet.cssText = css;
            } else {
              style.appendChild(win.document.createTextNode(css));
            } 
            head.appendChild(style);

            $(win.document.body)
                .css( 'font-size', '10pt' )

            $(win.document.body).find( 'table' )
                .addClass( 'compact' )
                .css( 'font-size', 'inherit' );
         	}
      	},
        {
            extend: 'colvis',
            text: '<i class="fas fa-columns"></i>',
            //visibility: true
        },
	    ],

			lengthMenu: [ [10, 50, 100, -1], [10, 50, 100, "Todo"] ],
			pageLength: 10,
			responsive: true,

		}

  }

	mesChange( mes ) {
		this.selectMes = mes;
		this.cargarDatosMes( mes, this.selectAnio )
	}

	anioChange( anio ) {
		this.selectAnio = anio;
		this.cargarDatosMes( this.selectMes , anio )
	}

	/*======================================
	=            Cargar Lugares            =
	======================================*/
  cargarLugares() {
    this.cargandoP = true;
    this._placeService.cargarPlaces( 0 , 0)
      .subscribe( (resp: any) => {
        this.places = resp.places.filter(p => p.deleted != true);
        this.cargandoP = false;
      });
  }

  /*=========================================
  =            Cargar Consultas             =
  =========================================*/
  cargarDatosMes( m = this.mes, a = this.anio ) {

		this.cargandoF = true;


		
		this.consultasChartLabels = [];
		this.consultasChartData = [];


		//turnos por rango de fechas
		this._consultaService.cargarRango( m, a )
			.subscribe( (resp: any) => {

				this.consultas = resp.consultas.filter( c => !c.deleted);

				let cArray = resp.consultas.filter( c => !c.deleted);

				//console.log(this.consultas);
				this.aplicarFiltros();
				//this.actualizarChart();

				/*----------  get turnos con asistencia  ----------*/
				let turnos = cArray.filter(t => t.date_t);
				//this.turnosMes = turnos.length;

				// prepare to chart
				let a_count = 0;
				for( let i = 0; i < turnos.length; ++i ) {
					if(turnos[i].asistencia_t == true )
							a_count++;
				}
				let a_diff = turnos.length - a_count;

				//this.asistenciaChartLabels = ['Asistidos', 'No asistidos'];
				if (a_count == 0 && a_diff == 0) {
					//this.asistenciaChartData = [];
				} else {
					//this.asistenciaChartData = [a_count, a_diff];
				}

			});
	}

	/*===============================
	=            Filtrar            =
	===============================*/
	tipo: string = '';
	place: string = '';
	contact: string = '';
	aplicarFiltros() {



		this.consultasChartLabels = [];
		this.consultasChartData = [];



		//console.log('this.place');
		//console.log(this.place);
		//console.log('this.tipo');
		//console.log(this.tipo);
		this.cargandoF = true;
		
		this.c_filtro = this.consultas.filter((c: any) => {

			c.date_filter = moment(c.createdAt).format('YYYY-MM-DD');

			if (this.tipo && this.place && this.contact) {
				//console.log('paso por alla this.tipo && this.place && this.contact');
				
				if (c.status === 'RESERVADO') {
					//console.log('is reservado');
					this.c_filtro.date_filter = moment(c.date_t).format('YYYY-MM-DD');
				} else {
					//console.log('no es reservado');
					c.date_filter = moment(c.createdAt).format('YYYY-MM-DD');
				}


				return c.status === this.tipo && (c.place_t && c.place_t._id === this.place || c.place_c && c.place_c._id === this.place) && c.medio_c === this.contact;
				
			} else if (this.tipo && this.place) {
				//console.log('paso por alla this.tipo && this.place');
				
				if (c.status === 'RESERVADO') {
					//console.log('is reservado');
					this.c_filtro.date_filter = moment(c.date_t).format('YYYY-MM-DD');
				} else {
					//console.log('no es reservado');
					c.date_filter = moment(c.createdAt).format('YYYY-MM-DD');
				}


				return c.status === this.tipo && (c.place_t && c.place_t._id === this.place || c.place_c && c.place_c._id === this.place);
				
			} else if (this.tipo && this.contact) {
				//console.log('paso por alla this.tipo && this.contact');
				
				if (c.status === 'RESERVADO') {
					//console.log('is reservado');
					this.c_filtro.date_filter = moment(c.date_t).format('YYYY-MM-DD');
				} else {
					//console.log('no es reservado');
					c.date_filter = moment(c.createdAt).format('YYYY-MM-DD');
				}


				return c.status === this.tipo && c.medio_c === this.contact;
				
			} else if (this.contact && this.place) {
				//console.log('paso por alla this.contact && this.place');
				this.c_filtro.date_filter = moment(this.c_filtro.createdAt).format('YYYY-MM-DD');
				return (c.place_t && c.place_t._id === this.place || c.place_c && c.place_c._id === this.place) && c.medio_c === this.contact;
				
			} else if (this.tipo) {
				//console.log('paso por aca solo this.tipo');
				
				if (c.status === 'RESERVADO') {
					//console.log('is reservado');
					//console.log(c);
					c.date_filter = moment(c.date_t).format('YYYY-MM-DD');
				} else {
					//console.log('no es reservado');
					c.date_filter = moment(c.createdAt).format('YYYY-MM-DD');
				}
				return c.status === this.tipo;

			} else if (this.place) {
				//console.log('paso por aca solo this.place');
				this.c_filtro.date_filter = moment(this.c_filtro.createdAt).format('YYYY-MM-DD');
				return c.place_t && c.place_t._id === this.place || c.place_c && c.place_c._id === this.place;

			} else if (this.contact) {
				//console.log('paso por aca solo this.contact');
				this.c_filtro.date_filter = moment(this.c_filtro.createdAt).format('YYYY-MM-DD');
				return c.medio_c === this.contact;

			}

			// consultas
			/*if (this.tipo === 'como_c' && this.first_c ) {
				return c.como_c &&  c.first_c === true;

			}  else if (this.tipo === 'date_t' && this.first_c ) {
				return c.date_t &&  c.first_c === true;

			} else if (this.tipo === 'paciente_c' && this.first_c ) {
				return c.paciente_c &&  c.first_c === true;

			} else if (this.tipo === 'como_c') {
				return c.como_c;

			}  else if (this.tipo === 'date_t') {
				return c.date_t;

			} else if (this.tipo === 'paciente_c') {
				return c.paciente_c;

			} */

			return true;
		});



		var date = this.c_filtro.map( (c: any) => c.date_filter), // fill it with array with your data
		results = [], rarr = [], i, date;

		//console.log('date');
		//console.log(date);

		//for (i=0; i<arr.length; i++) {
		//  // get the date
		//  date = moment(arr[i]).format('YYYY-MM-DD');
		//  results[date] = results[date] || 0;
		//  results[date]++;
		//}
//
//		//console.log('results');
//		//console.log(results);
//		////console.log('rarr');
//		////console.log(rarr);
//		//// you can always convert it into an array of objects, if you must
//		//for (i in results) {
//		//  if (results.hasOwnProperty(i)) {
//		//     rarr.push({date:i,counts:results[i]});
//		//  }
		//}


		/*----------  get medios de contacto  ----------*/
		//let medios = cArray.filter(c => c.medio_c !== undefined && c.medio_c !== null).map(c => c.medio_c);
		let finalMedios = date.reduce((b,c)=>((b[b.findIndex(d=>d.date===c)]||b[b.push({date:c,count:0})-1]).count++,b),[]);
		// prepare to chart
		//this.mediosChartLabels = finalMedios.map(m => m.medios);
		//this.mediosChartData = finalMedios.map(m => m.count);
		/*---------------------------------------*/
		//console.log('finalMedios');
		//console.log(finalMedios);

		this.consultasChartLabels = finalMedios.map( r => r.date);
		//this.consultasChartLabels = rarr.map( r => r.date);
		//console.log('this.consultasChartLabels');
		//console.log(this.consultasChartLabels);
		this.consultasChartData = finalMedios.map( r => r.count);
		//this.consultasChartData = rarr.map( r => r.counts);
		//console.log('this.consultasChartData');
		//console.log(this.consultasChartData);

		//this.actualizarChart();
		this.cargandoF = false;		
		//console.log('this.c_filtro');
		//console.log(this.c_filtro);

	}
}