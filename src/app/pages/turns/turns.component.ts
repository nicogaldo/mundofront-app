import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { NgbDatepickerI18n, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';

import { UsuarioService, ConsultaService, PlaceService, ClientService, ComboService, TurnService, ExtraService, CajaService, PagerService, I18n, CustomDatepickerI18n, MomentDateFormatter } from '../../services/service.index';
import { Usuario, Consulta, Place, Cliente, Homenajeado, Combo, Turn, Extra, Caja } from '../../models/index.model';

import { FullCalendarComponent } from '@fullcalendar/angular';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';

import { NgxSmartModalService } from 'ngx-smart-modal';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
  selector: 'app-turns',
  templateUrl: './turns.component.html',
  styles: [`.cargandoCalendar {height: 100vh;z-index: 5;background-image: linear-gradient(to bottom, #ffffff, #ffffff70, #ffffff00); }`],
  providers: [
    I18n,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: MomentDateFormatter },
  ]
})
export class TurnsComponent implements OnInit, AfterViewInit {

  usuario: Usuario;

  forma: FormGroup;
  formaFinalizar: FormGroup;
  formaPago: FormGroup;
  titleModal: string;
  isEdit: boolean = false;

  turnos: Consulta[] = [];
  cargando: boolean = true;
  places_c: Place[] = [];
  places_t: Place[] = [];
  cargandoP: boolean = false;
  clientes: Cliente[] = [];
  cargandoC: boolean = true;
  homenajeados: Homenajeado[] = [];
  cargandoH: boolean = false;
  combos: Combo[] = [];
  cargandoB: boolean = false;
  extras: Extra[] = [];
  cargandoE: boolean = false;
  misExtras: any[] = [];
  turnoParaPagar: any = [];

  horarios: Turn[] = [];
  cargandoT: boolean = false;

  selectedItem: string;
  sumaTotal: number;
  sumaTotalPagos: number;

  verDatos = '2 10 25 50 100'.split(' ');
  desde: number = 0;
  hasta: number = 2;
  pager: any = [];
  totalRegistros: number = 0;

  now = moment.utc().format('YYYY-MM-DD');
  today;
  currentMonth: any;
  //fromDate: any;
  //toDate: any;
  
  options: any;
  events: any[] = [];
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;
  calendarApi;

  //flag for disabled ng-slect
  disable:boolean = true;

  colors = [{
    id: 1,
    color_a: '#ef5350',
    color_b: '#EC407A',
    color_c: '#ef9a9a',
  },{
    id: 2,
    color_a: '#AB47BC',
    color_b: '#7E57C2',
    color_c: '#CE93D8',
  },{
    id: 3,
    color_a: '#5C6BC0',
    color_b: '#42A5F5',
    color_c: '#9FA8DA',
  },{
    id: 4,
    color_a: '#29B6F6',
    color_b: '#26C6DA',
    color_c: '#81D4FA',
  },{
    id: 5,
    color_a: '#26A69A',
    color_b: '#66BB6A',
    color_c: '#80CBC4',
  },{
    id: 6,
    color_a: '#9CCC65',
    color_b: '#D4E157',
    color_c: '#C5E1A5',
  },{
    id: 7,
    color_a: '#FFA726',
    color_b: '#FF7043',
    color_c: '#FFCC80',
  }]

  constructor(
		public _usuarioService: UsuarioService,
    public _consultaService: ConsultaService,
		public _placeService: PlaceService,
    public _clientService: ClientService,
    public _comboService: ComboService,
    public _turnService: TurnService,
    public _extraService: ExtraService,
    public _cajaService: CajaService,
		public _pagerService: PagerService,
		public ngxSmartModalService: NgxSmartModalService,
  ) {

    this.forma = new FormGroup({
      '_id': new FormControl( null ),
      'client_c_id': new FormControl( null, Validators.required ),
      'client_c': new FormControl( {value: null, disabled: true}, Validators.required ),
      'homenajeado_c': new FormControl( null, Validators.required ),
      'date_t': new FormControl( null, Validators.required ),
      'place_t': new FormControl( null, Validators.required ),
      'turno_t': new FormControl( null, Validators.required ),
      'combo_t': new FormControl( null, Validators.required ),
      //'sena_t': new FormControl( null, Validators.required ),
      //'sena_t_disabled': new FormControl( null, Validators.required ),
      //'sena_m': new FormControl( null, Validators.required ),
      //'sena_m_disabled': new FormControl( null, Validators.required ),
      'detalles_t': new FormControl( null ),
    })

    this.formaFinalizar = new FormGroup({
      '_id': new FormControl( null ),
      'extras': new FormControl( null ),
      //'e_monto': new FormControl( null ),
      //'e_dto': new FormControl( null ),
      //'t_monto': new FormControl( null ),
      //'t_tipo': new FormControl( null ),
      //'t_marca': new FormControl( null ),
      //'t_recargo': new FormControl( null ),
      //'t_cuotas': new FormControl( null ),
      //'transferencia': new FormControl( null ),
    })

    /*this.formaFinalizar.get('extras').valueChanges.subscribe( (id: string) => {

      if (id) {
        //let the_extra:any = this.extras.find(e => id.includes(e._id));
        //the_extra.total = the_extra.price;
        //this.misExtras.push(the_extra);

        this.misExtras = this.extras.filter(e => id.includes(e._id));

        this.misExtras.forEach((p) => {

          console.log('valueChanges extra', p.name, p.price, p.cant, p.total);

          if (p.total === undefined || p.total === p.price) {
            console.log('p.total && p.total === p.price', p.name, p.price, p.cant, p.total);
            p.total = p.price;

          } else {
            p.total = p.total;
            console.log('p.total else', p.name, p.price, p.cant, p.total);
          }
          p.cant = p.total / p.price;
          console.log('return extra', p.name, p.price, p.cant, p.total);
          console.log('__--=== space ===--__');
          this.changeTotal(p, p.cant, )
        })
      }

    })*/

    this.forma.get('place_t').valueChanges.subscribe( (id: string) => {

      if (!id) {
        this.forma.get('turno_t').disable();
        this.forma.get('combo_t').disable();
      } else {
        this.forma.get('turno_t').enable();
        this.forma.get('turno_t').reset()
        this.forma.get('combo_t').enable();
        this.forma.get('combo_t').reset()
        this.cargarHorariosDisponibles(id);
        this.cargarCombosDisponibles(id);
      }
    })

    /*this.forma.get('place_t').valueChanges.subscribe( (id: string) => {

      if (!id) {
        this.forma.get('turno_t').disable();
      } else {
        this.forma.get('turno_t').enable();
        this.cargarHorariosDisponibles(id);
      }
    })*/

    if (!this.isEdit) {

      this.forma.get('client_c').valueChanges.subscribe( (id: string) => {
        if (!id) {
          this.forma.get('homenajeado_c').disable();
        } else {
          this.forma.get('homenajeado_c').enable();
          this.cargarHomenajeados(id);        
        }
      })
    }

    this.formaPago = new FormGroup({
      'consulta_id': new FormControl( null, Validators.required ),
      'medio_pago': new FormControl( 'Efectivo', Validators.required ),
      //pago con tarjeta
      't_tipo': new FormControl( '' ),
      't_marca': new FormControl( '' ),
      't_recargo': new FormControl( null ),
      't_cuotas': new FormControl( null ),
      //'t_monto': new FormControl( null ),
      //'e_descuento': new FormControl( null ),
      //'e_monto': new FormControl( null ),
      //'debe': new FormControl( null ),
      'monto': new FormControl( null, Validators.required ),
      'dto': new FormControl( null ),
      'detalles': new FormControl( null ),
      'completar': new FormControl( false ),
    })

    this.formaPago.get('medio_pago').valueChanges.subscribe( (data: string) => {

      if (data === 'Tarjeta') {
        this.formaPago.get('dto').setValue( 0 );
        this.formaPago.get('t_tipo').setValidators(Validators.required);
        this.formaPago.get('t_marca').setValidators(Validators.required);
        this.formaPago.get('t_recargo').setValidators(Validators.required);
        this.formaPago.get('t_cuotas').setValidators(Validators.required);

      } else {
        this.formaPago.get('dto').clearValidators();
        this.formaPago.get('t_tipo').clearValidators();
        this.formaPago.get('t_marca').clearValidators();
        this.formaPago.get('t_recargo').clearValidators();
        this.formaPago.get('t_cuotas').clearValidators();

      }

      if (data === 'Efectivo') {
        this.formaPago.get('dto').setValidators(Validators.required);

      } else {
        this.formaPago.get('dto').clearValidators();

      }

    })

  }

  ngOnInit() {
    this.usuario = this._usuarioService.usuario;

    this.pager.currentPage = 1;
    this.cargarLugares();
    //this.cargarTotalTurnosMes();

    let n = moment.utc(this.now).format('YYYY-MM-DD').split('-');
    this.today = {
      year: parseInt(n[0]),
      month: parseInt(n[1]),
      day: parseInt(n[2])
    }

    this.options = {
      plugins: [ dayGridPlugin, listPlugin, timeGridPlugin ],
      timeZone: 'America/Buenos Aires',
      locale: 'esLocale',
      firstDay: 1,
      nowIndicator: true,
      eventTimeFormat: {
        hour: 'numeric',
        minute: '2-digit',
        meridiem: false
      },
      buttonText: {
        today: 'Hoy',
        dayGridMonth: 'Mes',
        timeGridWeek: 'Semana',
        dayGridDay: 'Día',
        listMonth: 'Lista'
      },
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,dayGridDay,listMonth'
      },
      views: {
        timeGridWeek: {
          buttonText: 'Semana',
          allDaySlot: false,
          minTime: '09:00:00',
          maxTime: '22:00:00',
          titleFormat: { month: 'long', day: 'numeric' },
          slotLabelFormat: [
            {
              hour: 'numeric',
              minute: '2-digit',
              omitZeroMinute: false,
             },
          ]
        }
      },

      defaultView: 'timeGridWeek',
      events: this.events
    };
  }

  ngAfterViewInit() {
    //const calendarApi = this.calendarComponent.getApi();
    this.calendarApi = this.calendarComponent.getApi();
    this.calendarApi.setOptions(this.options);
    //console.log('calendarApi');
    //console.log(calendarApi);
    //this.calendarApi.next();
    this.calendarApi.render();
  }

  addExtra(p, consulta) {
    this.misExtras.push(p);
    this.changeTotal(p, 1, consulta);
  }

  removeExtra(p, consulta) {
    this.misExtras = this.misExtras.filter( e => e._id !== p.value._id);
    this.calcularTotal(consulta);
  }

  changeTotal( p, value, consulta ) {
    p.total = p.price * value;
    p.cant =  parseInt(value);
    this.calcularTotal(consulta);
  }

  calcularTotal( c ) {

    //console.log('c', c);

    //let sena = c.sena_t;
    let combo = c.combo_t.price;
    let extrasTotal = 0;

    if (c.pago) {

      c.pago.forEach( (p) => {

        if (p.extras && p.extras.length) {
          //console.log('hay extra', p.extras.map(e => e.total).reduce((a, b) => a + b));
          combo = combo + p.extras.map(e => e.total).reduce((a, b) => a + b);
        }

      })
    }
    //console.log('this.misExtras', this.misExtras);
    if (this.misExtras.length > 0) {
      extrasTotal = this.misExtras.map(e => e.total).reduce((a, b) => a + b);
    }

    //get total extras
      //extrasTotal = extrasTotal;
    //console.log('extrasTotal', extrasTotal);
    //console.log('combo', combo);
    /*if (extrasTotal) {
      extrasTotal = extrasTotal.reduce((a, b) => a + b);
    }*/
    //console.log(extrasTotal);
    this.sumaTotal = (extrasTotal + combo);
    let totalPagos = c.pago.reduce((sum, current) => sum + current.total, 0);
    this.sumaTotalPagos = this.sumaTotal - totalPagos;
    //console.log(this.sumaTotal);
  }

  /*====================================
  =            Cargar Datos            =
  ====================================*/
  cargarClientes() {
    this.cargandoC = true;
    this._clientService.cargarClientes()
      .subscribe( (resp: any) => {
        this.clientes = resp.clientes.filter(c => c.deleted != true);
        this.cargandoC = false;
      });
  }

  cargarHomenajeados(id) {
    this.cargandoH = true;
    this._clientService.cargarHomenajeadosParent(id)
      .subscribe( (resp: any) => {
        let h = resp.homenajeados.filter(h => h.deleted != true);
        if (h) {
          this.homenajeados = h;
          //console.log(this.homenajeados);
        } else {
          this.homenajeados = null;
        }
        
        this.cargandoH = false;
      })
  }

  cargarLugares() {
    this.cargandoP = true;
    this._placeService.cargarPlaces( 0, 0)
      .subscribe( (resp: any) => {
        //this.places = resp.places.filter(p => !p.deleted);
        this.places_c = resp.places.filter(p => !p.deleted);
        this.places_t = resp.places.filter(p => !p.deleted && p.desc != '@all@');
        this.cargandoP = false;

        if (this.places_c.length) {
          this.selectedItem = this.places_c[0]._id;
          this.cargarTurnos(this.selectedItem);
        }

      });
  }

  the_horarios:any [] = [];
  cargarHorariosDisponibles( place_id ) {
    this.cargandoT = true;
    this.the_horarios = [];

    this._turnService.cargarPlacesTurns(place_id)
      .subscribe( (resp: any) => {
        //this.turnos = resp.turn;

        //check turno
        this._consultaService.cargarTurnosFecha( this.forma.value.date_t, place_id )
          .subscribe( (resp_c:any) => {

            let turnos_ocupados = resp_c.consultas;

            if (resp.turn.length > 0) {

              turnos_ocupados.map((i: any) => {

                let here = false;
                if (i._id === this.forma.value._id) {
                  here = true;
                }

                if (i.status === 'RESERVADO' || i.status === 'FINALIZADO') {
                  return { 'name': i.turno_t.name, 'here': here }
                }
                return true;

              }).forEach(i => this.the_horarios.push(i));

              resp.turn.map(k => {
                let ans = this.the_horarios.some(function(arrVal) {
                  return k.name === arrVal.name && !arrVal.here;
                });
                if (ans) { k.disabled = true; }
              })

              this.horarios = resp.turn;
              this.cargandoT = false;
            }
          })
      })
  }

  cargarCombosDisponibles(id) {
    this.cargandoB = true;
    this._comboService.cargarPlacesCombos(id)
      .subscribe( (resp: any) => {
        this.combos = resp.combos.filter(c => c.deleted != true);
        this.cargandoB = false;
      });
  }

  cargarExtrasDisponibles(id) {
    this.cargandoE = true;
    this._extraService.cargarPlacesExtras(id)
      .subscribe( (resp: any) => {
        this.extras = resp.extras.filter(e => e.deleted != true);
        //console.log('this.extras', this.extras);
        this.cargandoE = false;
      });
  }

  /*======================================
  =            Cargar Turnos            =
  ======================================*/
  /*cargarTotalTurnosMes() {
    this._consultaService.cargarTurnosRango( this.fromDate, this.toDate )
      .subscribe( (resp: any) => {
        //this.turnos = resp.turnos;
        //this.totalRegistros = resp.total;
      });
  }*/
  proxTurnos =  [];
  cargarTurnos( id ) {
    this.events = [];
    this.cargando = true;
    let color = "#745af2";
    let place = this.places_c.find(p => p._id === id);

    this._consultaService.cargarTurnosLugar( id, place.desc )
      .subscribe( (resp: any) => {

        this.turnos = resp.turnos;
        //this.totalRegistros = this.turnos.filter(t => t.date_t > this.now).length;
        //console.log(this.turnos);

        if (this.turnos.length > 0) {
          // preparar data eventos
          this.turnos.map((item: any) => {

            //let paciente_nombre = item.homenajeado_c.nombre+' '+item.homenajeado_c.apellido;
            let paciente_nombre = item.client_c.nombre+' '+item.client_c.apellido;
            let prepare_date = moment.utc(item.date_t).format('YYYY-MM-DD');
            let prepare_from = moment.utc(prepare_date + ' ' + item.turno_t.from).toISOString();
            let prepare_to = moment.utc(prepare_date + ' ' + item.turno_t.to).toISOString();
            let classname;
            let cancel = false;

            if (item.status === 'CANCELADO') {
              cancel = true;
              classname = 'cancel';
            }

            if (item.place_t.color1) {
              let the_colours = this.colors.find(c => c.id == item.place_t.color1);
              color = the_colours.color_a;
              if (item.status === 'CANCELADO') {
                color = the_colours.color_c;
              } else if (item.status === 'FINALIZADO') {
                color = the_colours.color_b
              }

            } else {
              color = "#745af2";
              if (item.status === 'CANCELADO') {
                color = "#aaa";
              } else if (item.status === 'FINALIZADO') {
                color = '#8BC34A'
              }
            }

            return {
              'id': item._id,
              'title': paciente_nombre,
              'start': prepare_from,
              'end': prepare_to,
              'startEditable': false,
              'durationEditable': false,
              'color': color,
              'status': item.status,
              'className': classname,
              'cancelado': cancel,
            }
          }).forEach(item => this.events.push(item));

          let myEvents = this.events;
          let myTotalRegistros: any[] =  [];

          this.calendarApi.setOptions({
            events: this.events,
            datesRender: (i) => {

              let tR_from = moment.utc(i.view.currentStart).startOf('month').toISOString();
              let tR_to = moment.utc(i.view.currentStart).endOf('month').toISOString();

              myTotalRegistros = myEvents.filter(e => e.start >= tR_from && e.start <= tR_to);
              this.currentMonth = moment.utc(tR_from).format('MMMM');
              this.totalRegistros = myTotalRegistros.length;

              //console.log('myTotalRegistros');
              //console.log(myTotalRegistros);

              /*let place_data = myTotalRegistros.map((item: any) => {                
              })*/

              //----------- reservados -----------
              let r_proximos = myTotalRegistros.map( (c: any) => c.start > this.now), // fill it with array with your data
              r_results = [], r_rarr = [], r_the_dias = [];

              r_rarr = r_proximos.reduce((b,c)=>((b[b.findIndex(d=>d.prox===c)]||b[b.push({prox:c,count:0})-1]).count++,b),[]);
              //r_the_dias = r_rarr.map(item => ({ prox: item, count: 0 }));
              this.proxTurnos = r_rarr.map(x => Object.assign(x, r_rarr.find(y => y.prox == x.prox)));
              //console.log('r_results');
              //console.log(r_results);

              //----------- reservados -----------
              let f_finalizado = myTotalRegistros.map( (c: any) => c.status), // fill it with array with your data
              f_results = [], f_rarr = [], f_the_dias = [];

              //console.log('f_finalizado');
              //console.log(f_finalizado);

              f_rarr = f_finalizado.reduce((b,c)=>((b[b.findIndex(d=>d.status===c)]||b[b.push({status:c,count:0})-1]).count++,b),[]);
              //f_the_dias = f_rarr.map(item => ({ status: item, count: 0 }));
              f_results = f_rarr.map(x => Object.assign(x, f_rarr.find(y => y.status == x.status)));
              //console.log('f_results');
              //console.log(f_results);

            }
          })

          //this.calendarApi.render();
          this.calendarApi.rerenderEvents();
        }

        this.cargando = false;
  		});
  }

  /*====================================
  =              Ver Turno             =
  ====================================*/
  finalizadoTotal: number;
  verTurno( data: any ) {
    let the_turno = this.turnos.find(t => t._id === data.event.id);

    if (the_turno.status === 'FINALIZADO') {
      this.finalizadoTotal = the_turno.pago.map(e => e.total).reduce((a, b) => a + b);
    }

    this.calcularTotal(the_turno);

    this.ngxSmartModalService.getModal('vTm').open();
    this.ngxSmartModalService.setModalData( the_turno, 'vTm' );
  }

  resetModal() {
    this.ngxSmartModalService.resetModalData('vTm');
  }

  cancelarTurno( turno ) {

    let place = turno.place_t;
    let message: string;

    if (turno.status === 'CANCELADO') {
      turno.status = 'RESERVADO';
      message = 'Turno habilitado';
    } else {
      turno.status = 'CANCELADO';
      message = 'Turno cancelado';
    }

    this._consultaService.actualizarConsulta( turno )
      .subscribe( resp => {

        this.cargarTurnos(turno.place_t._id);
        this.ngxSmartModalService.getModal('vTm').close();
        swal({
          type: 'success',
          title: message,
          showConfirmButton: false,
          timer: 2000
        });

      });
  }

  borrarTurno( id ) {

    let turno: Consulta = this.turnos.find(t => t._id === id);

    swal({
      title: '¿Estas seguro?',
      text: 'Esta a punto de borrar el turno',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si! Borrar',
      cancelButtonText: 'Cancelar'
    })
    .then( borrar => {
      if (borrar.value) {

        turno.status = 'CONSULTA';
        turno.date_t = null;
        turno.place_t = null;
        turno.turno_t = null;
        turno.combo_t = null;
        //turno.sena_t = null;
        //turno.sena_m = null;
        turno.detalles_t = null;

        this._consultaService.actualizarConsulta( turno )
          .subscribe( resp => {

            this.ngxSmartModalService.getModal('turnoModal').close();
            this.ngxSmartModalService.getModal('vTm').close();

            swal({
              type: 'success',
              title: '¡Listo!',
              text: 'Turno Borrado',
              showConfirmButton: false,
              timer: 2000
            });

            this.cargarTurnos(this.selectedItem);
          });
      }
    });
  }

  reprogramarTurno( the_turno ) {

    if (this.clientes.length <= 0) {
      this.cargarClientes();
      this.cargarHomenajeados(the_turno.client_c._id);
      //this.cargarHorariosDisponibles(the_turno.place_t._id);
      //this.cargarCombosDisponibles(the_turno.place_t._id);
    }

    this.isEdit = true;
    this.titleModal = 'Editar/Reprogrmar Turno';
    this.ngxSmartModalService.getModal('turnoModal').open();
    this.ngxSmartModalService.setModalData( the_turno, 'turnoModal' );

    let f = moment.utc(the_turno.date_t).format('YYYY-MM-DD').split('-');

    //console.log('the_turno', the_turno);

    this.forma.patchValue({
      _id: the_turno._id,
      client_c_id: the_turno.client_c._id,
      client_c: the_turno.client_c._id,
      homenajeado_c: the_turno.homenajeado_c._id,
      //date_t: moment.utc(the_turno.date_t).utc().format('YYYY-MM-DD'),
      date_t: {
        year: parseInt(f[0]),
        month: parseInt(f[1]),
        day: parseInt(f[2])
      },
      place_t: the_turno.place_t._id,
      turno_t: the_turno.turno_t._id,
      combo_t: the_turno.combo_t._id,
      //sena_t: the_turno.sena_t,
      //sena_t_disabled: the_turno.sena_t,
      //sena_m: the_turno.sena_m,
      //sena_m_disabled: the_turno.sena_m,
      detalles_t: the_turno.detalles_t,
    })

    //this.forma.get('sena_t_disabled').disable();
    //this.forma.get('sena_m_disabled').disable();
  }

  finalizarTurno( the_turno ) {

    this.calcularTotal(the_turno);

    //console.log('the_turno finalizar', the_turno);

    if (this.extras.length <= 0) {
      this.cargarExtrasDisponibles(the_turno.place_t._id);
    }

    this.titleModal = 'Finalizar Turno';

    this.ngxSmartModalService.getModal('vTm').close();
    //this.ngxSmartModalService.getModal('turnoModal').close();

    //if (document.body.classList.contains('dialog-open')) {
    //  document.body.classList.remove('dialog-open');
    //}

    this.ngxSmartModalService.getModal('fTm').open();
    this.ngxSmartModalService.setModalData( the_turno, 'fTm' );

    this.formaFinalizar.patchValue({
      _id: the_turno._id,
    })

    //this.sumaTotal = the_turno.combo_t.price;
    //let totalPagos = the_turno.pago.reduce((sum, current) => sum + current.total, 0);
    //this.sumaTotalPagos = this.sumaTotal - totalPagos;
  }

  resetFinalizar() {
    this.formaFinalizar.reset();
    this.ngxSmartModalService.resetModalData('fTm');
  }

  guardarFinalizar() {

    if (!this.formaFinalizar.valid) {
      return
    }

    if (this.sumaTotal) {

      let turno: any = this.turnos.find(t => t._id ===  this.formaFinalizar.value._id);

      let medio = {
        efectivo: this.formaFinalizar.value.efectivo,
        tarjeta: this.formaFinalizar.value.tarjeta,
        transferencia: this.formaFinalizar.value.transferencia,
      }

      //console.log('medio');
      //console.log(medio);

      let the_extras:any[] = [];

      if (this.formaFinalizar.value.extras) {

        //console.log('this.misExtras');
        //console.log(this.misExtras);

        this.misExtras.map((item: any) => {

          return {
            'extra': item._id,
            'cantidad': item.cant,
            'monto': item.total,
          }
        }).forEach(item => the_extras.push(item));

        //console.log('the_extras');
        //console.log(the_extras);
      }

      let pago: any = {
        medio: JSON.stringify(medio),
        monto_combo_cobrado: turno.combo_t.price,
        descuento: 0,
        sena: turno.sena_t,
        date_pago: this.now,
        extras: the_extras,
        total: this.sumaTotal + turno.sena_t,
      }

      //console.log('pago');
      //console.log(pago);

      //turno.servicios_extra = this.formaFinalizar.value.extras;
      //turno.monto_f = this.sumaTotal;
      turno.pago = pago;
      turno.status = 'FINALIZADO';

      let the_mov: Caja;
      if (turno.sena_t) {
        turno.status = 'RESERVADO';
        turno.sena_date = moment().toDate().toISOString();

        the_mov = {
          tipo: 'INGRESO',
          medio: JSON.stringify(medio),
          consulta: turno._id,
          cliente: turno.client_c,
          monto: turno.sena_t,
          descuento: 0,
          extras: null,
          total: turno.sena_t,
        }
      }

      //console.log('turno');
      //console.log(turno);
      
      this._consultaService.actualizarConsulta( turno )
        .subscribe( resp => {

          this.ngxSmartModalService.getModal('fTm').close();
          this.ngxSmartModalService.getModal('vTm').close();

          if (document.body.classList.contains('dialog-open')) {
            document.body.classList.remove('dialog-open');
          }

          swal({
            type: 'success',
            title: '¡Listo!',
            text: 'Turno Finalizado',
            showConfirmButton: false,
            timer: 2000
          });

          this.cargarTurnos(this.selectedItem);
        });
    }
  }

  /*===================================
  =            Nuevo Turno            =
  ===================================*/
  nuevoTurno() {

    if (this.clientes.length <= 0) {
      this.cargarClientes();
      //this.cargarHomenajeados(the_turno.client_c._id);
      //this.cargarHorariosDisponibles(the_turno.place_t._id);
      //this.cargarCombosDisponibles(the_turno.place_t._id);
    }

    this.isEdit = false;
    this.titleModal = 'Nuevo Turno';
    this.ngxSmartModalService.getModal('turnoModal').open();
  }

  guardarTurno() {

    let d: any = this.forma.value.date_t;
    //console.log('date', d);
    let date_format = moment.utc(d.year + '-' + d.month + '-' + d.day, 'YYYY-MM-DD').toISOString();
    //let date_format = moment.utc(d.year, d.month, d.day).subtract(1, 'months').toISOString();
    //console.log('date_format', date_format);

    let c: Combo = this.combos.find(c => c._id === this.forma.value.combo_t);

    let the_turno: Consulta = {
      client_c: this.forma.value.client_c_id,
      //client_c: this.forma.value.client_c,
      homenajeado_c: this.forma.value.homenajeado_c,
      date_c: null,
      place_c: null,
      medio_c: null,
      como_c: null,
      detalles_c: null,
      date_t: date_format,
      place_t: this.forma.value.place_t,
      turno_t: this.forma.value.turno_t,
      combo_t: this.forma.value.combo_t,
      //sena_t: this.forma.value.sena_t,
      //sena_m: this.forma.value.sena_m,
      detalles_t: this.forma.value.detalles_t,
      status: 'RESERVADO',
      to_pay: c.price,
      balance: c.price,
    }

    if (this.isEdit) {

      let turno = this.turnos.find(t => t._id === this.forma.value._id);
      the_turno._id = turno._id;
      the_turno.status = turno.status;
      the_turno.deleted = turno.deleted;
      the_turno.pago = turno.pago;

      //si es una consulta -> completar los campos de consulta
      if (turno.medio_c) {
        the_turno.date_c = turno.date_c;
        the_turno.place_c = turno.place_c;
        the_turno.medio_c = turno.medio_c;
        the_turno.como_c = turno.como_c;
        the_turno.detalles_c = turno.detalles_c;
      }

      // check the balance
      this._cajaService.cargarMovimientosConsulta( the_turno._id )
        .subscribe( (resp: any) => {
          //console.log('resp', resp.cajas);
          let pagos = resp.cajas;
          if (pagos) {
            pagos = pagos.reduce((sum, current) => sum + current.total, 0);
            //console.log('pagos', pagos);
            the_turno.balance = c.price - pagos;
            
            // actualizar consulta
            this._consultaService.actualizarConsulta( the_turno )
              .subscribe( resp => {

                this.ngxSmartModalService.getModal('vTm').close();
                this.ngxSmartModalService.getModal('turnoModal').close();

                if (document.body.classList.contains('dialog-open')) {
                  document.body.classList.remove('dialog-open');
                }

                swal({
                  type: 'success',
                  title: 'Turno Reprogramado',
                  showConfirmButton: false,
                  timer: 2000
                });
                this.isEdit = false;
                this.cargarTurnos(the_turno.place_t);
              });
          
          } else {
            console.log('bueno aca hay un problema porque si deberia tener un pago realizado.');
          }

        });

      //console.log('the_turno', the_turno);
      
    } else {
      console.log('nuevo turno');
      /*if (the_turno.sena_t) {
        the_turno.status = 'RESERVADO';
      }
      //console.log('the_turno');
      //console.log(the_turno);
      this._consultaService.crearConsulta( the_turno )
        .subscribe( (resp: any) => {
          this.ngxSmartModalService.getModal('turnoModal').close();
          this.cargarTurnos(the_turno.place_t);
          swal({
            type: 'success',
            title: 'Turno creado!',
            showConfirmButton: false,
            timer: 2000
          });
        })*/
    } //end if
  }

  /*=====================================
  =            Realizar pago            =
  =====================================*/
  openPago( data ) {

    //console.log('data', data);
    //console.log('misExtras', this.misExtras);
    this.turnoParaPagar = this.turnos.find(t => t._id === data._id);

    if (this.misExtras.length) {
      let extrasTotal = this.misExtras.map(e => e.total).reduce((a, b) => a + b);
      //extrasTotal = extrasTotal;
      this.turnoParaPagar.extras = this.misExtras;
      this.turnoParaPagar.to_pay_with_extras = this.turnoParaPagar.to_pay + extrasTotal;
    }

    //console.log('turnoParaPagar', this.turnoParaPagar);
    this.ngxSmartModalService.get('rPm').open();

    this.formaPago.get('consulta_id').setValue(data._id);
  }
  /*=====  End of Realizar pago  ======*/

  guardarPago() {

    if (!this.formaPago.valid) {
      return
    }

    //console.log('this.formaPago', this.formaPago.value);

    let the_consulta: any = this.turnos.find(c => c._id === this.formaPago.value.consulta_id);
    let the_extras: any[] = [];
    let the_mov: Caja;
    //the_consulta.pago = [];
    //the_consulta.sena_date = moment().toDate().toISOString();
    //the_consulta.to_pay = combo.price;
    //the_consulta.balance = combo.price - sena_t;

    this.misExtras.forEach( (e) => {
      let extra = {
        extra: e._id,
        name: e.name,
        price: e.price,
        cant: e.cant,
        total: e.total
      }
      the_extras.push(extra)
    })

    //console.log('the_extras', the_extras);

    the_mov = {
      consulta: the_consulta._id,
      cliente: the_consulta.client_c._id,
      tipo: 'INGRESO',
      medio: this.formaPago.value.medio_pago,
      t_tipo: this.formaPago.value.t_tipo,
      t_marca: this.formaPago.value.t_marca,
      t_recargo: this.formaPago.value.t_recargo,
      t_cuotas: this.formaPago.value.t_cuotas,
      monto: this.formaPago.value.monto,
      descuento: this.formaPago.value.dto,
      extras: the_extras,
      total: this.formaPago.value.monto,
      detalles: this.formaPago.value.detalles
    }

    // monto con descuento
    if (this.formaPago.value.dto) {
      the_mov.total = this.sumaTotalPagos - ((this.sumaTotalPagos * (this.formaPago.value.dto ? this.formaPago.value.dto : 0)) / 100);
      //console.log('hay dto', the_mov.total);
    }

    // monto con recargo
    if (this.formaPago.value.t_recargo) {
      the_mov.total = this.sumaTotalPagos + ((this.sumaTotalPagos * (this.formaPago.value.t_recargo ? this.formaPago.value.t_recargo : 0)) / 100);
      //console.log('hay recargo', the_mov.total);
    }

    //balance
    if (!this.formaPago.value.completar && this.formaPago.value.medio_pago === 'Tarjeta') {
      the_consulta.balance = (this.sumaTotalPagos + ((this.sumaTotalPagos * (this.formaPago.value.t_recargo ? this.formaPago.value.t_recargo : 0)) / 100)) - this.formaPago.value.monto
    }

    if (!this.formaPago.value.completar && this.formaPago.value.medio_pago === 'Efectivo' || this.formaPago.value.medio_pago === 'Transferencia') {
      the_consulta.balance = this.sumaTotalPagos - ((this.sumaTotalPagos * this.formaPago.value.dto) / 100) === this.formaPago.value.monto ? 0 : this.sumaTotalPagos - this.formaPago.value.monto
    }

    //the_consulta.balance = the_consulta.balance - this.formaPago.value.monto;
    
    //console.log('balance', the_consulta.balance);

    if (this.formaPago.value.completar) {
      the_consulta.balance = 0;

      if (the_mov.detalles) {
        the_mov.detalles += ' [completó pago]';
      } else {
        the_mov.detalles = '[completó pago]';
      }

      //console.log('completo -> balance', the_consulta.balance);
    }

    if (the_consulta.balance === 0) {
      the_consulta.status = 'FINALIZADO';
    }

    // guardar la consulta
    //console.log('the_consulta', the_consulta);
    //console.log('the_mov', the_mov);
    
    this._cajaService.crearMovimiento( the_mov )
      .subscribe( (resp: any) => {

        the_consulta.pago.push(resp);
        this.calcularTotal(the_consulta);
        //console.log('the_consulta con pago', the_consulta);

        this._consultaService.actualizarConsulta( the_consulta )
          .subscribe( (resp: any) => {

            let m = '¡Pago Registrado!';
            this.ngxSmartModalService.getModal('rPm').close();

            if (the_consulta.balance === 0) {
              m = '¡Turno Finalizado!';
              this.ngxSmartModalService.getModal('fTm').close();
            }

            //actualizo data de modal
            this.ngxSmartModalService.setModalData( the_consulta, 'vTm' );

            swal({
              type: 'success',
              title: m,
              text: '',
              showConfirmButton: false,
              timer: 2000
            });

            this.cargarTurnos(this.selectedItem);
          })
      })

  }

}