import { Component, OnInit, ViewChild, AfterViewInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { map } from 'rxjs/operators';

import { UsuarioService, ConsultaService, PlaceService, MomentDateFormatter, CustomDatepickerI18n, I18n } from '../../../services/service.index';
import { Usuario, Consulta, Place } from '../../../models/index.model';

import { NgbDateStruct, NgbCalendar, NgbDateParserFormatter, NgbDatepicker, NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import * as moment from 'moment';
moment.locale('es');

/* datepicker */
const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
	? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
	? false : one.day > two.day : one.month > two.month : one.year > two.year;
/**/

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.component.html',
  styles: [],
	providers: [
	    I18n,
	    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
	    //{ provide: NgbDateParserFormatter, useClass: MomentDateFormatter },
	]
})
export class ReservasComponent implements OnInit, AfterViewInit {

	/* datepicker */
	@Output() onOpenChange = new EventEmitter<boolean>();
	@Output() onDateChange = new EventEmitter<any>();
	@Input() from: any;
	@Input() to: any;
	@ViewChild('myDrop') dropdown: any;
	@ViewChild('dp') datepicker: NgbDatepicker;

	hoveredDate: NgbDateStruct;
	fromDate: NgbDateStruct;
	toDate: NgbDateStruct;
	/**/

	usuario: Usuario;
	titulo: string;

  places: Place[] = [];
  cargandoP: boolean = false;
  reservas: Consulta[] = [];
  reservasAno: Consulta[] = [];
  cargandoC: boolean = false;
  c_filtro: any[] = [];
  cargandoF: boolean = false;

	now = moment.utc().format('YYYY-MM-DDTHH:mm');
	hoy = moment.utc().format('YYYY-MM-DD');
	mes = moment.utc(this.hoy).month();
	//mes = moment.utc(this.hoy).subtract(1,'months').month();
	anio = moment.utc().year();

	dias = [];
	dias_label = [];
	meses = moment.months();
	mesesShort = moment.monthsShort();
	n_meses = Array.from(Array(11).keys());
	anios = [ 2020, 2019, 2018, 2017 ];

	//selects
	selectMes: number = this.mes;
	selectAnio: number = this.anio;

	@ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
	//dtOptions: DataTables.Settings = {};
	dtTrigger: Subject<any> = new Subject();
	dtOptions: any = {};	
	chartOptions: any = {};

	public reservasChartLabels:string[] = [];
	public reservasChartData:any[] = [];
	public reservasChartType:string = 'line';

	public placeChartLabels:string[] = [];
	public placeChartData:any[] = [];
	public placeChartType:string = 'doughnut';

	public medioChartLabels:string[] = [];
	public medioChartData:any[] = [];
	public medioChartType:string = 'doughnut';

  constructor(
		public _usuarioService: UsuarioService,
    public _consultaService: ConsultaService,
    public _placeService: PlaceService,
    public calendar: NgbCalendar,
    private ngbDateParserFormatter: NgbDateParserFormatter
  ) {

  	/* datepicker */
		this.from = moment().startOf('month').format('YYYY-MM-DD');
		this.to = moment().endOf('month').format('YYYY-MM-DD');
		//this.fromDate = calendar.getToday();
		//this.toDate = calendar.getToday();
		//this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
  }

  /* datepicker */
	isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
	isInside = date => after(date, this.fromDate) && before(date, this.toDate);
	isFrom = date => equals(date, this.fromDate);
	isTo = date => equals(date, this.toDate);

	openChange(event) {
		this.onOpenChange.emit(event);
	}

	dateChange(date: NgbDateStruct, changeMonth: boolean = false) {

		if (!this.fromDate && !this.toDate) {
			this.fromDate = date;
		} else if (this.fromDate && !this.toDate && this.isAfterOrSame(date, this.fromDate)) {
			this.toDate = date;

		} else if (changeMonth) {
			this.fromDate = this.ngbDateParserFormatter.parse(this.from);
			this.toDate = this.ngbDateParserFormatter.parse(this.to);
			this.datepicker.navigateTo(this.fromDate);

		} else {
			this.toDate = null;
			this.fromDate = date;
		}

		this.pushDate();
	}

	private pushDate() {
		if (this.fromDate && this.toDate) {

			this.from = this.ngbDateParserFormatter.format(this.fromDate);
			this.to = this.ngbDateParserFormatter.format(this.toDate);

			this.cargarDatosRango( this.from, this.to );
			this.getDaysArrayByRango( this.from, this.to );
			this.selectMes = moment(this.from).month();

			this.onDateChange.emit({ from: this.from, to: this.to });
			this.dropdown.close();
		}
	}

	private isAfterOrSame(one: NgbDateStruct, two: NgbDateStruct) {
		if (!one || !two) {
			return false;
		}

		let parsedFrom = this.ngbDateParserFormatter.format(one);
		let parsedTo = this.ngbDateParserFormatter.format(two);
		if (moment(parsedFrom).isAfter(parsedTo) || moment(parsedFrom).isSame(parsedTo)) {
			return true;
		}
		
		return false;
	}

	ngOnChanges() {
		if (this.from && this.to) {
			this.fromDate = this.ngbDateParserFormatter.parse(this.from);
			this.toDate = this.ngbDateParserFormatter.parse(this.to);
		}
	}
	/**/

  ngOnInit() {

  	/* datepicker */
		if (this.from && this.to) {
			this.fromDate = this.ngbDateParserFormatter.parse(this.from);
			this.toDate = this.ngbDateParserFormatter.parse(this.to);
		}
		/**/

		this.cargarDatosAno();
		this.cargarDatosRango( this.from, this.to );
		this.cargarLugares();

  	this.getDaysArrayByRango( this.from, this.to );

		this.chartOptions = {
			//legend: false,
      scales: {
        yAxes: [{
          ticks: {
            suggestedMin: 5,
        		beginAtZero: true,
            stepSize: 1
          }
        }]
      }
		}

		this.dtOptions = {
			language: {
		    search: "Buscar",
		    info: "Mostrando un total de _TOTAL_",
		    infoEmpty: "Sin datos para mostrar",
		    zeroRecords: "Sin datos para mostrar",
		    //url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/Spanish.json",
		  } ,
			dom: 'Blfript',
 			buttons: [
        {
        	extend: 'excelHtml5',
	        text: '<i class="far fa-file-excel"></i>',
	        titleAttr: 'Exportar Excel',
	        //title: 'Estadisticas de ' + moment(this.selectMes).format('MMMM')
	        title: 'Estadisticas de ' + this.selectMes
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
            visibility: true
        },
	    ],

			//lengthMenu: [ [10, 50, 100, -1], [10, 50, 100, "Todo"] ],
			//pagingType: 'full_numbers',
      //pageLength: 10,
			responsive: true,
			retrieve: true,
    	paging: false,
    	order: [ 5, 'desc' ]
		}

  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

	mesChange( mes ) {
		this.from = moment().month(mes).startOf('month').format('YYYY-MM-DD');
    this.to = moment().month(mes).endOf('month').format('YYYY-MM-DD');

    this.dateChange( this.fromDate, true);

		this.onDateChange.emit({ from: this.from, to: this.to });

		this.selectMes = mes;
		this.getDaysArrayByRango( this.from, this.to );
		//this.cargarDatosRango( mes, this.selectAnio );
		this.cargarDatosRango( this.from, this.to );
	}

	anioChange( anio ) {
		this.selectAnio = anio;
		this.getDaysArrayByRango( this.from, this.to );
		this.cargarDatosRango( this.selectMes , anio );
		this.cargarDatosAno( anio );
	}

	getDaysArrayByRango( from, to ) {

	  let arrDays = [];
	  let arrDays_label = [];

		let start = moment.utc(from);
		let end = moment.utc(to);

		//console.log(moment(start).format('YYYY-MM-DD'), 'start');
		//console.log(moment(end).format('YYYY-MM-DD'), 'end');

	  while (start <= end) {
			arrDays.push(moment(start).format('YYYY-MM-DD'));
			arrDays_label.push(moment(start).format('ddd DD'));
			let newDate = moment(start).add(1, 'd');
			start = newDate;
		}

	  this.dias_label;
	  this.dias = arrDays;
	  this.dias_label = arrDays_label;
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
  cargarDatosAno( a = this.anio ) {

  	this._consultaService.cargarAno( a, 'turnos' )
			.subscribe( (resp: any) => {

				let reservasAno:any = resp.consultas.filter( c => !c.deleted);
				let n_months = Array(12).fill(0).map((e,i)=>i+1);
				//let r_data = reservasAno.map( (c: any) => c.date_t.split(('-'))[1]), // fill it with array with your data
				
				let r_data = reservasAno.map( (c: any) => {
					//console.log(c._id);
					//console.log(c.date_t);
					return c.date_t.split(('-'))[1]
				}),

				r_rarr = [], r_the_months = [];
				r_rarr = r_data.reduce((b,c)=>((b[b.findIndex(d=>d.month===c)]||b[b.push({month:c,count:0})-1]).count++,b),[]);
				r_the_months = n_months.map(item => ({ month: item, count: 0 }));
		    this.reservasAno = r_the_months.map(x => Object.assign(x, r_rarr.find(y => y.month == x.month)));
				
			});
  }

  cargarDatosRango( desde = this.from, hasta = this.to ) {

		this.cargandoF = true;

		this.reservasChartLabels = [];
		this.reservasChartData = [];

		this.medioChartLabels = [];
		this.medioChartData = [];

		this.placeChartLabels = [];
		this.placeChartData = [];

		this.reservas = [];

		//console.log('desde:', desde);
		//console.log('hasta:', hasta);

		//todo por rango de fechas (fecha de creación)
		this._consultaService.cargarRango( desde, hasta, 'turnos' )
			.subscribe( (resp: any) => {

				this.reservas = resp.consultas.filter( c => !c.deleted);
				//console.log('resp', resp);
				this.aplicarFiltroLista();
				this.aplicarFiltroGrafico();
			});
	}

	aplicarFiltroGrafico() {

		//----------  prepare chart  ----------				
		let reservas = this.reservas.filter(c => c.status === 'CONSULTA'),
				reservados = this.reservas.filter(c => c.status === 'RESERVADO'),
				finalizados = this.reservas.filter(c => c.status === 'FINALIZADO'),
				cancelados = this.reservas.filter(c => c.status === 'CANCELADO'),
				results = [];

		//----------- reservas -----------
		let c_date = reservas.map( (c: any) => c.date_filter), // fill it with array with your data
		c_results = [], c_rarr = [], c_the_dias = [];

		//console.log('c_date');
		//console.log(c_date);

		c_rarr = c_date.reduce((b,c)=>((b[b.findIndex(d=>d.date===c)]||b[b.push({date:c,count:0})-1]).count++,b),[]);

		//console.log('c_rarr');
		//console.log(c_rarr);

    //console.log('this.dias');
    //console.log(this.dias);

		c_the_dias = this.dias.map(item => ({ date: item, count: 0 }));

    //console.log('c_the_dias');
    //console.log(c_the_dias);

    c_results = c_the_dias.map(x => Object.assign(x, c_rarr.find(y => y.date == x.date)));

    //console.log('c_results');
    //console.log(c_results);

		//----------- reservados -----------
		let r_date = reservados.map( (c: any) => c.date_filter), // fill it with array with your data
		r_results = [], r_rarr = [], r_the_dias = [];

		r_rarr = r_date.reduce((b,c)=>((b[b.findIndex(d=>d.date===c)]||b[b.push({date:c,count:0})-1]).count++,b),[]);
		r_the_dias = this.dias.map(item => ({ date: item, count: 0 }));
    r_results = r_the_dias.map(x => Object.assign(x, r_rarr.find(y => y.date == x.date)));
    //console.log('r_results');
    //console.log(r_results);

		//----------- finalizados -----------
		let f_date = finalizados.map( (c: any) => c.date_filter), // fill it with array with your data
		f_results = [], f_rarr = [], f_the_dias = [];

		f_rarr = f_date.reduce((b,c)=>((b[b.findIndex(d=>d.date===c)]||b[b.push({date:c,count:0})-1]).count++,b),[]);
		f_the_dias = this.dias.map(item => ({ date: item, count: 0 }));
    f_results = f_the_dias.map(x => Object.assign(x, f_rarr.find(y => y.date == x.date)));
    //console.log('f_results');
    //console.log(f_results);

		//----------- cancelados -----------
		let x_date = cancelados.map( (c: any) => c.date_filter), // fill it with array with your data
		x_results = [], x_rarr = [], x_the_dias = [];

		x_rarr = x_date.reduce((b,c)=>((b[b.findIndex(d=>d.date===c)]||b[b.push({date:c,count:0})-1]).count++,b),[]);
		x_the_dias = this.dias.map(item => ({ date: item, count: 0 }));
    x_results = x_the_dias.map(x => Object.assign(x, x_rarr.find(y => y.date == x.date)));
    //console.log('x_results');
    //console.log(x_results);

    results = [
			//{ data: c_results.map( r => r.count), label: 'Consultas (' + c_date.length + ')' },
			{ data: r_results.map( r => r.count), label: 'Reservados (' + r_date.length + ')' },
			{ data: f_results.map( r => r.count), label: 'Finalizados (' + f_date.length + ')' },
			{ data: x_results.map( r => r.count), label: 'Cancelados (' + x_date.length + ')' },
    ];

		this.reservasChartLabels = this.dias_label;
		this.reservasChartData = results;

		/*----------  get medios de contacto  ----------*/
		let medios = this.reservas.filter(c => c.medio_c !== undefined && c.medio_c !== null).map(c => c.medio_c);
		let finalMedios = medios.reduce((b,c)=>((b[b.findIndex(d=>d.medios===c)]||b[b.push({medios:c,count:0})-1]).count++,b),[]);
		// prepare to chart
		this.medioChartLabels = finalMedios.map(m => {
			m.medios = `${m.medios} (${m.count})`;
			return m.medios
		});
		this.medioChartData = finalMedios.map(m => m.count);

		/*----------  get place nos conocio  ----------*/
		let place = this.reservas.filter(c => c.place_t !== undefined && c.place_t !== null).map((c:any) => c.place_t.name);
		let finalPlace = place.reduce((b,c)=>((b[b.findIndex(d=>d.place===c)]||b[b.push({place:c,count:0})-1]).count++,b),[]);
		// prepare to chart
		this.placeChartLabels = finalPlace.map(m => {
			m.place = `${m.place} (${m.count})`;
			return m.place
		});
		this.placeChartData = finalPlace.map(m => m.count);

		this.cargandoF = false;
	}

	/*===============================
	=            Filtrar            =
	===============================*/
	tipo: string = '';
	place: string = '';
	contact: string = '';
	aplicarFiltroLista() {

		//this.reservasChartLabels = [];
		//this.reservasChartData = [];
		let the_reservas = this.reservas;

		this.c_filtro = the_reservas.filter((c: any) => {

			c.date_filter = moment.utc(c.date_t).format('YYYY-MM-DD');

			// Selecciono 3 filtros
			if (this.tipo && this.place && this.contact) {
				return c.status === this.tipo && (c.place_t && c.place_t._id === this.place) && c.medio_c === this.contact;

			// Selecciono Tipo y Lugar
			} else if (this.tipo && this.place) {
				return c.status === this.tipo && (c.place_t && c.place_t._id === this.place);
				
			// Selecciono Tipo y Contacto
			} else if (this.tipo && this.contact) {
				return c.status === this.tipo && c.medio_c === this.contact;
				
			// Selecciono Contacto y Lugar
			} else if (this.contact && this.place) {
				return (c.place_t && c.place_t._id === this.place) && c.medio_c === this.contact;
				
			// Selecciono Tipo
			} else if (this.tipo) {
				return c.status === this.tipo;

			// Selecciono Lugar
			} else if (this.place) {
				return c.place_t && c.place_t._id === this.place;

			// Selecciono Medio de Contacto
			} else if (this.contact) {
				return c.medio_c === this.contact;

			}

			return true;
		})

		//this.c_filtro = this.c_filtro.sort((a,b) => a.createdAt - b.createdAt);

		//this.dtTrigger.next();
		this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
			// Destroy the table first 
			dtInstance.destroy();
			// Call the dtTrigger to rerender again 
			this.dtTrigger.next();
		});

		//console.log('this.c_filtro');
		//console.log(this.c_filtro);

		/*----------  set chart data  ----------*/
		//let date = this.c_filtro.map( (c: any) => c.date_filter), // fill it with array with your data
		//results = [], rarr = [], the_dias = [];
		//rarr = date.reduce((b,c)=>((b[b.findIndex(d=>d.date===c)]||b[b.push({date:c,count:0})-1]).count++,b),[]);
		//the_dias = this.dias.map(item => ({ date: item, count: 0 }));
    //results = the_dias.map(x => Object.assign(x, rarr.find(y => y.date == x.date)));

		//this.reservasChartLabels = this.dias_label;
		//this.reservasChartData = [ { data: results.map( r => r.count), label: this.tipo } ];

		//this.cargandoF = false;

	}

}
