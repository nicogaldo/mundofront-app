import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { UsuarioService, ConsultaService, PlaceService, ClientService, ComboService, TurnService, PagerService } from '../../services/service.index';
import { Usuario, Consulta, Place, Cliente, Homenajeado, Combo, Turn } from '../../models/index.model';

import { CalendarComponent } from 'ng-fullcalendar';
import { Options } from 'fullcalendar';

import { NgxSmartModalService } from 'ngx-smart-modal';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
  selector: 'app-turns',
  templateUrl: './turns.component.html'
})
export class TurnsComponent implements OnInit {

  usuario: Usuario;

  forma: FormGroup;
  formaEdit: FormGroup;
  formaTurnoEdit: FormGroup;
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

  horarios: Turn[] = [];
  cargandoT: boolean = false;

  selectedItem: string;

  verDatos = '2 10 25 50 100'.split(' ');
  desde: number = 0;
  hasta: number = 2;
  pager: any = [];
  totalRegistros: number = 0;

  now = moment().format('YYYY-MM-DD');
  events: any = [];
  calendarOptions: Options;
  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;

  constructor(
		public _usuarioService: UsuarioService,
    public _consultaService: ConsultaService,
		public _placeService: PlaceService,
    public _clientService: ClientService,
    public _comboService: ComboService,
    public _turnService: TurnService,
		public _pagerService: PagerService,
		public ngxSmartModalService: NgxSmartModalService,
  ) {

    this.forma = new FormGroup({
      '_id': new FormControl( null ),
      'client_c': new FormControl( null, Validators.required ),
      'homenajeado_c': new FormControl( null, Validators.required ),
      'date_t': new FormControl( null, Validators.required ),
      'place_t': new FormControl( null, Validators.required ),
      'turno_t': new FormControl( null, Validators.required ),
      'combo_t': new FormControl( null, Validators.required ),
      'sena_t': new FormControl( null ),
      'detalles_t': new FormControl( null ),
    })


    this.forma.get('place_t').valueChanges.subscribe( (id: string) => {

      if (!id) {
        this.forma.get('turno_t').disable();
      } else {
        this.forma.get('turno_t').enable();
        this.cargarTurnosDisponibles(id);        
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
  	this.cargarTurnosProximos();

    // Calendar Options
    this.calendarOptions = {
      editable: true,
      eventLimit: false,
      locale: 'es-ES',
      timeFormat: 'H:mm',
      allDaySlot: false,
      slotLabelFormat: 'H:mm',
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
      minTime: moment.duration('07:00:00'),
      maxTime: moment.duration('23:00:00'),
      selectable: true,
      events: this.events
    };
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
          console.log(this.homenajeados);
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
        this.places = resp.places;
        this.cargandoP = false;
      });
  }

  cargarTurnosDisponibles( id ) {
    this.cargandoT = true;
    this._turnService.cargarPlacesTurns(id)
      .subscribe( (resp: any) => {
        this.horarios = resp.turn;
        this.cargandoT = false;
      })
  }

  cargarCombos() {
    this.cargandoB = true;
    this._comboService.cargarCombos( 0 , 0)
      .subscribe( (resp: any) => {
        this.combos = resp.combos.filter(c => c.deleted != true);
        this.cargandoB = false;
      });
  }

  /*======================================
  =            Cargar Turnos            =
  ======================================*/
  cargarTurnosProximos() {
    this._consultaService.cargarTurnos( this.now )
      .subscribe( (resp: any) => {
        //this.turnos = resp.turnos;
        this.totalRegistros = resp.total;
      });
  }

  cargarTurnos( id ) {

    this.events = [];
    let color = "#745af2";

    this.cargando = true;
    this._consultaService.cargarTurnosLugar( id )
      .subscribe( (resp: any) => {

        this.turnos = resp.turnos;
        this.totalRegistros = this.turnos.filter(t => t.date_t > this.now).length;
        this.cargando = false;

        if (this.turnos.length > 0) {
          // preparar data eventos
          this.turnos.map((item: any) => {

            let paciente_nombre = item.homenajeado_c.nombre+' '+item.homenajeado_c.apellido;
            let prepare_date = moment(item.date_t).utc().format('YYYY-MM-DD');
            //console.log(prepare_date);
            let classname;
            let cancel = false;

            if (item.status === 'CANCELADO') {
              cancel = true;
              classname = 'cancel';
              color = "#aaa";
            }

            return {
                'id': item._id,
                'title': paciente_nombre,
                'profesional': item.place_t.name,
                'start': moment(prepare_date+ ' ' +item.turno_t.from),
                'end': moment(prepare_date+ ' ' +item.turno_t.to),
                'startEditable': false,
                'durationEditable': false,
                'color': color,
                'className': classname,
                'cancelado': cancel,
            }
          }).forEach(item => this.events.push(item));
        }

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
      this.cargarTurnosDisponibles(the_turno.place_t._id);
      this.cargarCombos();
    }

    this.isEdit = true;
    this.titleModal = 'Editar Turno';
    this.ngxSmartModalService.getModal('turnoModal').open();
    this.ngxSmartModalService.setModalData( the_turno, 'turnoModal' );

    this.forma.patchValue({
      _id: the_turno._id,
      client_c: the_turno.client_c._id,
      homenajeado_c: the_turno.homenajeado_c._id,
      date_t: moment(the_turno.date_t).utc().format('YYYY-MM-DD'),
      place_t: the_turno.place_t._id,
      turno_t: the_turno.turno_t._id,
      combo_t: the_turno.combo_t._id,
      sena_t: the_turno.sena_t,
      detalles_t: the_turno.detalles_t,
    })
  }

  nuevoTurno() {

    if (this.clientes.length <= 0) {
      this.cargarClientes();
      //this.cargarHomenajeados(the_turno.client_c._id);
      //this.cargarTurnosDisponibles(the_turno.place_t._id);
      this.cargarCombos();
    }

    this.isEdit = false;
    this.titleModal = 'Nuevo Turno';
    this.ngxSmartModalService.getModal('turnoModal').open();
  }

  guardarTurno() {

    let the_turno: Consulta = {
      client_c: this.forma.value.client_c,
      homenajeado_c: this.forma.value.homenajeado_c,
      medio_c: null,
      como_c: null,
      place_c: null,
      detalles_c: null,
      date_t: moment(this.forma.value.date_t).toISOString(),
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

          this.cargarTurnos(this.forma.value.place_t);
          this.ngxSmartModalService.getModal('vTm').close();
          this.ngxSmartModalService.getModal('turnoModal').close();

          swal({
            type: 'success',
            title: 'Turno Reprogramado',
            showConfirmButton: false,
            timer: 2000
          });

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