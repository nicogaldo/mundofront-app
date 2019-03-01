import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { NgbDatepickerI18n, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';

import { UsuarioService, ConsultaService, PlaceService, ClientService, ComboService, TurnService, ExtraService, PagerService, I18n, CustomDatepickerI18n, MomentDateFormatter } from '../../services/service.index';
import { Usuario, Consulta, Place, Cliente, Homenajeado, Combo, Turn, Extra } from '../../models/index.model';

import { CalendarComponent } from 'ng-fullcalendar';
import { Options } from 'fullcalendar';

import { NgxSmartModalService } from 'ngx-smart-modal';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
  selector: 'app-turns',
  templateUrl: './turns.component.html',
  providers: [
    I18n,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: MomentDateFormatter },
  ]
})
export class TurnsComponent implements OnInit {

  usuario: Usuario;

  forma: FormGroup;
  formaFinalizar: FormGroup;
  titleModal: string;
  isEdit: boolean = false;

  turnos: Consulta[] = [];
  cargando: boolean = false;
  places: Place[] = [];
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

  horarios: Turn[] = [];
  cargandoT: boolean = false;

  selectedItem: string;
  sumaTotal: number;

  verDatos = '2 10 25 50 100'.split(' ');
  desde: number = 0;
  hasta: number = 2;
  pager: any = [];
  totalRegistros: number = 0;

  now = moment().format('YYYY-MM-DD');
  today;
  fromDate: any;
  toDate: any;

  events: any[] = [];
  calendarOptions: Options;
  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;

  constructor(
		public _usuarioService: UsuarioService,
    public _consultaService: ConsultaService,
		public _placeService: PlaceService,
    public _clientService: ClientService,
    public _comboService: ComboService,
    public _turnService: TurnService,
    public _extraService: ExtraService,
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
      'sena_t': new FormControl( null ),
      'detalles_t': new FormControl( null ),
    })

    this.formaFinalizar = new FormGroup({
      '_id': new FormControl( null ),
      'extras': new FormControl( null ),
      'efectivo': new FormControl( null ),
      'tarjeta': new FormControl( null ),
      'transferencia': new FormControl( null ),
    })

    this.formaFinalizar.get('extras').valueChanges.subscribe( (id: string) => {

      if (id) {
        //let the_extra:any = this.extras.find(e => id.includes(e._id));
        //the_extra.total = the_extra.price;
        //this.misExtras.push(the_extra);

        this.misExtras = this.extras.filter(e => id.includes(e._id));
        
        let total = 0;
        this.misExtras.forEach((p) => {
          if (!p.total) {
            p.total = p.price;
          } else {
            p.total = p.total;
          }
          p.cant = p.total / p.price;
        })
      }

    })

    this.forma.get('place_t').valueChanges.subscribe( (id: string) => {

      if (!id) {
        this.forma.get('turno_t').disable();
      } else {
        this.forma.get('turno_t').enable();
        this.cargarHorariosDisponibles(id);
      }
    })

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

  }

  ngOnInit() {
    this.usuario = this._usuarioService.usuario;

    this.pager.currentPage = 1;
    this.cargarLugares();
    //this.cargarTotalTurnosMes();

    let n = moment(this.now).format('YYYY-MM-DD').split('-');
    this.today = {
      year: parseInt(n[0]),
      month: parseInt(n[1]),
      day: parseInt(n[2])
    }

    // Calendar Options
    this.calendarOptions = {
      editable: true,
      eventLimit: false,
      locale: 'es-ES',
      timeFormat: 'H:mm',
      allDaySlot: false,
      slotLabelFormat: 'H:mm',
      columnFormat: 'ddd D/M',
      nowIndicator: true,
      buttonText: {
        today: 'Hoy',
        month: 'Mes',
        week: 'Semana',
        day: 'Día',
        list: 'Lista'
      },
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay,listMonth'
      },
      defaultView: 'agendaWeek',
      
      minTime: moment.duration('09:00:00'),
      maxTime: moment.duration('22:00:00'),
      selectable: true,
      events: this.events
    };

    


  }

  changeTotal( p, value, consulta ) {
    p.total = p.price * value;
    p.cant =  parseInt(value);
    this.calcularTotal(consulta);
  }

  calcularTotal( c ) {

    let sena = c.sena_t;
    let combo = c.combo_t.price;

    //console.log('this.misExtras');
    //console.log(this.misExtras);

    //get total extras
    let extrasTotal = this.misExtras.map(e => e.total);
    //console.log('extrasTotal');
    //console.log(extrasTotal);
    if (extrasTotal) {
      extrasTotal = extrasTotal.reduce((a, b) => a + b);
    }
    //console.log(extrasTotal);

    this.sumaTotal = (extrasTotal + combo) - sena;
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
        this.places = resp.places.filter(p => !p.deleted);
        this.cargandoP = false;

        if (this.places.length) {
          this.selectedItem = this.places[0]._id;
          this.cargarTurnos(this.selectedItem);
        }

      });
  }

  the_horarios:any [] = [];
  cargarHorariosDisponibles( place_id ) {
    this.cargandoT = true;
    this._turnService.cargarPlacesTurns(place_id)
      .subscribe( (resp: any) => {
        //this.turnos = resp.turn;

        //check turno
        this._consultaService.cargarTurnosFecha( this.forma.value.date_t, place_id )
          .subscribe( (resp_c:any) => {

            let turnos_ocupados = resp_c.consultas;
            let horario;

            if (resp.turn.length > 0) {

              turnos_ocupados.map((item: any) => {
                return { 'name': item.turno_t.name }

              }).forEach(item => this.the_horarios.push(item));

              resp.turn.map(item => {
                let ans = this.the_horarios.some(function(arrVal) {
                  return item.name === arrVal.name;

                });

                if (ans) { item.disabled = true; }
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
        //console.log(this.extras);
        this.cargandoE = false;
      });
  }

  /*======================================
  =            Cargar Turnos            =
  ======================================*/
  cargarTotalTurnosMes() {
    this._consultaService.cargarTurnosRango( this.fromDate, this.toDate )
      .subscribe( (resp: any) => {
        //this.turnos = resp.turnos;
        this.totalRegistros = resp.total;
      });
  }

  cargarTurnos( id ) {

    this.events = [];
    this.cargando = true;
    let color = "#745af2";
    //let month = this.ucCalendar.fullCalendar();
    //console.log('month');
    //console.log(month);
    
    this._consultaService.cargarTurnosLugar( id )
      .subscribe( (resp: any) => {

        this.turnos = resp.turnos;
        this.totalRegistros = this.turnos.filter(t => t.date_t > this.now).length;

        //console.log(this.turnos);

        if (this.turnos.length > 0) {
          // preparar data eventos
          this.turnos.map((item: any) => {

            let paciente_nombre = item.homenajeado_c.nombre+' '+item.homenajeado_c.apellido;
            let prepare_date = moment(item.date_t).format('YYYY-MM-DD');
            let prepare_to = moment.utc(prepare_date + ' ' + item.turno_t.to).toISOString();
            let prepare_from = moment.utc(prepare_date + ' ' + item.turno_t.from).toISOString();
            let classname;
            let cancel = false;

            if (item.status === 'CANCELADO') {
              cancel = true;
              classname = 'cancel';
              color = "#aaa";

            } else if (item.status === 'FINALIZADO') {
              color = '#8BC34A'
            }

            return {
              'id': item._id,
              'title': paciente_nombre,
              'start': prepare_from,
              'end': prepare_to,
              'startEditable': false,
              'durationEditable': false,
              'color': color,
              'className': classname,
              'cancelado': cancel,
            }
          }).forEach(item => this.events.push(item));

          this.ucCalendar.fullCalendar( 'renderEvents', this.events, true);
        }

        this.cargando = false;
  		});
  }

  /*====================================
  =              Ver Turno             =
  ====================================*/
  verTurno( data: any ) {

    let the_turno = this.turnos.find(t => t._id === data.event.id);
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
        turno.sena_t = null;
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

    console.log(the_turno);

    if (this.clientes.length <= 0) {
      this.cargarClientes();
      this.cargarHomenajeados(the_turno.client_c._id);
      this.cargarHorariosDisponibles(the_turno.place_t._id);
      this.cargarCombosDisponibles(the_turno.place_t._id);
    }

    this.isEdit = true;
    this.titleModal = 'Editar Turno';
    this.ngxSmartModalService.getModal('turnoModal').open();
    this.ngxSmartModalService.setModalData( the_turno, 'turnoModal' );

    let f = moment(the_turno.date_t).format('YYYY-MM-DD').split('-');

    this.forma.patchValue({
      _id: the_turno._id,
      client_c_id: the_turno.client_c._id,
      client_c: the_turno.client_c._id,
      homenajeado_c: the_turno.homenajeado_c._id,
      //date_t: moment(the_turno.date_t).utc().format('YYYY-MM-DD'),
      date_t: {
        year: parseInt(f[0]),
        month: parseInt(f[1]),
        day: parseInt(f[2])
      },
      place_t: the_turno.place_t._id,
      turno_t: the_turno.turno_t._id,
      combo_t: the_turno.combo_t._id,
      sena_t: the_turno.sena_t,
      detalles_t: the_turno.detalles_t,
    })
  }

  finalizarTurno( the_turno ) {

    console.log(the_turno);

    if (this.extras.length <= 0) {
      this.cargarExtrasDisponibles(the_turno.place_t._id);
    }

    this.titleModal = 'Finalizar Turno';
    this.ngxSmartModalService.getModal('fTm').open();
    this.ngxSmartModalService.setModalData( the_turno, 'fTm' );

    this.formaFinalizar.patchValue({
      _id: the_turno._id,
    })

    this.sumaTotal = the_turno.combo_t.price - the_turno.sena_t;
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

      console.log('medio');
      console.log(medio);

      let the_extras:any[] = [];

      if (this.formaFinalizar.value.extras) {

        console.log('this.misExtras');
        console.log(this.misExtras);

        this.misExtras.map((item: any) => {

          return {
            'extra': item._id,
            'cantidad': item.cant,
            'monto': item.total,
          }
        }).forEach(item => the_extras.push(item));

        console.log('the_extras');
        console.log(the_extras);

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

      console.log('pago');
      console.log(pago);

      //turno.servicios_extra = this.formaFinalizar.value.extras;
      //turno.monto_f = this.sumaTotal;
      turno.pago = pago;
      turno.status = 'FINALIZADO';

      console.log('turno');
      console.log(turno);
      
      this._consultaService.actualizarConsulta( turno )
        .subscribe( resp => {
          this.ngxSmartModalService.getModal('fTm').close();
          this.ngxSmartModalService.getModal('vTm').close();
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

    let date_format = moment(this.forma.value.date_t).subtract(1, 'months').toISOString();
    let the_turno: Consulta = {
      client_c: this.forma.value.client_c_id,
      //client_c: this.forma.value.client_c,
      homenajeado_c: this.forma.value.homenajeado_c,
      medio_c: null,
      como_c: null,
      place_c: null,
      detalles_c: null,
      date_t: date_format,
      place_t: this.forma.value.place_t,
      turno_t: this.forma.value.turno_t,
      combo_t: this.forma.value.combo_t,
      sena_t: this.forma.value.sena_t,
      detalles_t: this.forma.value.detalles_t,
    }

    if (this.isEdit) {

      let turno = this.turnos.find(t => t._id === this.forma.value._id);
      the_turno._id = turno._id;
      the_turno.status = turno.status;
      the_turno.deleted = turno.deleted;

      //si es una consulta -> completar los campos de consulta
      if (turno.medio_c) {
        the_turno.medio_c = turno.medio_c;
        the_turno.como_c = turno.como_c;
        the_turno.place_c = turno.place_c;
        the_turno.detalles_c = turno.detalles_c;
      }

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

          this.cargarTurnos(the_turno.place_t);
        });
      
    } else {

      if (the_turno.sena_t) {
        the_turno.status = 'RESERVADO';
      }

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

        })
    } //end if

  }

 
  
}