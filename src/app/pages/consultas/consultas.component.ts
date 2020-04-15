import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbDatepickerI18n, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';

import { UsuarioService, ConsultaService, ClientService, PlaceService, ComboService, TurnService, CajaService, PagerService, I18n, CustomDatepickerI18n, MomentDateFormatter } from '../../services/service.index';
import { Usuario, Consulta, Cliente, Homenajeado, Place, Combo, Turn, Caja } from '../../models/index.model';

import { NgxSmartModalService } from 'ngx-smart-modal';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.component.html',
  styleUrls: ['./consultas.component.css'],
  providers: [
    I18n,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: MomentDateFormatter },
  ]
})
export class ConsultasComponent implements OnInit {

  forma: FormGroup;
  formaTurno: FormGroup;
  formaCliente: FormGroup;
  formaHomenajeado: FormGroup;
  //form_nuevo = false;

  usuario: Usuario;
  consultas: Consulta[] = [];
  clientes: Cliente[] = [];
  cargandoC: boolean = true;
  homenajeados: Homenajeado[] = [];
  cargandoH: boolean = false;
  places_c: Place[] = [];
  places_t: Place[] = [];
  cargandoP: boolean = false;
  combos: Combo[] = [];
  cargandoB: boolean = false;
  //turnos: Turn[] = [];
  turnos: any[] = [];
  cargandoT: boolean = false;

  now = moment.utc().format('YYYY-MM-DD');
  today;

  verDatos = '10 25 50 100'.split(' ');
  desde: number = 0;
  hasta: number = 10;
  pager: any = [];
  totalRegistros: number = 0;
  cargando: boolean = true;

  constructor(
		public _usuarioService: UsuarioService,
    public _consultaService: ConsultaService,
    public _clientService: ClientService,
    public _placeService: PlaceService,
    public _comboService: ComboService,
    public _turnService: TurnService,
    public _cajaService: CajaService,
		public _pagerService: PagerService,
		public ngxSmartModalService: NgxSmartModalService,
  ) {

    this.forma = new FormGroup({
      'scliente': new FormControl(null),
      'shomenajeado': new FormControl({value: null, disabled: true}),

      'consulta': new FormGroup({
        'date_c': new FormControl(null, Validators.required),
        'medio_c': new FormControl(null, Validators.required),
        'como_c': new FormControl(null, Validators.required),
        'place_c': new FormControl(null, Validators.required),
        'detalles_c': new FormControl(null),
      }),
      //'turno': new FormGroup({
      //  'date_t': new FormControl(null),
      //  'place_t': new FormControl(null),
      //  'turno_t': new FormControl(null),
      //  'combo_t': new FormControl(null),
      //  'sena_t': new FormControl(null),
      //  'detalles_t': new FormControl(null),
      //})
    })

  	this.formaTurno = new FormGroup({
       '_id': new FormControl(null, Validators.required),
      'date_t': new FormControl(null, Validators.required),
      'place_t': new FormControl(null, Validators.required),
      'turno_t': new FormControl(null, Validators.required),
      'combo_t': new FormControl(null, Validators.required),
      'sena_t': new FormControl(null, Validators.required),
      'sena_m': new FormControl(null, Validators.required),
      't_tipo': new FormControl(null),
      't_marca': new FormControl(null),
      'detalles_t': new FormControl(null),
    })

    this.formaTurno.get('place_t').valueChanges.subscribe( (id: string) => {
      if (!id) {
        this.formaTurno.get('turno_t').disable();
      } else {
        this.formaTurno.get('turno_t').enable();
        this.cargarTurnosDisponibles(id);
        this.cargarCombosDisponibles(id);
      }
    })

    this.formaCliente = new FormGroup({
      'nombre': new FormControl(null, Validators.required),
      'apellido': new FormControl(null),
      'telefono': new FormControl(null),
      'email': new FormControl(null, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')),
      'detalles': new FormControl(null)
    })

    this.forma.get('scliente').valueChanges.subscribe( (id: string) => {
      if (!id) {
        this.forma.get('shomenajeado').disable();
      } else {
        this.forma.get('shomenajeado').enable();
        this.cargarHomenajeados(id);        
      }
    })

    this.formaHomenajeado = new FormGroup({
      'parent': new FormControl(null, Validators.required),
      'nombre': new FormControl(null, Validators.required),
      'apellido': new FormControl(null),
      'nacimiento': new FormControl(null),
      'genero': new FormControl(null),
      'colegio': new FormControl(null)
    })

    this.formaTurno.get('sena_m').valueChanges.subscribe( (val: string) => {
      if (val == 'Tarjeta') {
        this.formaTurno.get('t_tipo').setValidators(Validators.required);
        this.formaTurno.get('t_marca').setValidators(Validators.required);
      } else if (val != 'Tarjeta') {
        this.formaTurno.get('t_tipo').clearValidators();
        this.formaTurno.get('t_marca').clearValidators();
      }
      this.formaTurno.get('t_tipo').updateValueAndValidity();
      this.formaTurno.get('t_marca').updateValueAndValidity();
    })

    /*=========================================
    =             Valid Date Turno            =
    =========================================*/
    //this.forma.get('turno.date_t').valueChanges.subscribe( (date: string) => {
    //  if (date != null) {
    //    this.forma.get('turno.sena_t').setValidators(Validators.required);
    //    this.forma.get('turno.place_t').setValidators(Validators.required);
    //    this.forma.get('turno.combo_t').setValidators(Validators.required);
    //    this.forma.get('turno.turno_t').setValidators(Validators.required);
    //  } else if (date === null) {
    //    this.forma.get('turno.place_t').clearValidators();
    //    this.forma.get('turno.combo_t').clearValidators();
    //    this.forma.get('turno.turno_t').clearValidators();
    //    this.forma.get('turno.sena_t').patchValue(null);
    //    this.forma.get('turno.place_t').patchValue(null);
    //    this.forma.get('turno.combo_t').patchValue(null);
    //  }
    //  this.forma.get('turno.sena_t').updateValueAndValidity();
    //  this.forma.get('turno.place_t').updateValueAndValidity();
    //  this.forma.get('turno.combo_t').updateValueAndValidity();
    //  this.forma.get('turno.turno_t').updateValueAndValidity();
    //})
  }

  ngOnInit() {
    this.pager.currentPage = 1;
    this.cargarConsultas();
		//this.cargarCombos();

    let n = this.now.split('-');
    this.today = {
      year: parseInt(n[0]),
      month: parseInt(n[1]),
      day: parseInt(n[2])
    }
  }

  /*====================================
  =            Cargar Datos            =
  ====================================*/
  cargarConsultas() {
    this.cargando = true;
    this._consultaService.cargarConsultas( this.desde, this.hasta )
      .subscribe( (resp: any) => {
        this.consultas = resp.consultas.filter(c => !c.deleted);
        this.totalRegistros = resp.total;
        this.cargando = false;
        
        this.setPage(1);
      });
  }

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
        } else {
          this.homenajeados = null;
        }
        
        this.cargandoH = false;
      })
  }

  cargarLugares() {
    this.cargandoP = true;
    this._placeService.cargarPlaces( 0 , 0)
      .subscribe( (resp: any) => {
        this.places_c = resp.places.filter(p => !p.deleted);
        this.places_t = resp.places.filter(p => !p.deleted && p.desc != '@all@');
        //this.places.push({ name: 'Todos', _id: 'all'});
        this.cargandoP = false;
      });
  }

  the_horarios: any[] = [];
  cargarTurnosDisponibles( id ) {
    this.cargandoT = true;
    this.the_horarios = [];

    this._turnService.cargarPlacesTurns(id)
      .subscribe( (resp: any) => {


        console.log('datepiker consultas', this.formaTurno.value.date_t);

        //check turno
        this._consultaService.cargarTurnosFecha( this.formaTurno.value.date_t, id )
          .subscribe( (resp_c:any) => {

            let turnos_ocupados = resp_c.consultas;

            if (resp.turn.length > 0) {

              turnos_ocupados.map((i: any) => {

                if (i.status === 'RESERVADO' || i.status === 'FINALIZADO') {
                  return { 'name': i.turno_t.name }
                }
                return true;
                
              }).forEach(i => this.the_horarios.push(i));

              resp.turn.map(k => {
                let ans = this.the_horarios.some(function(arrVal) {
                  return k.name === arrVal.name;
                });
                if (ans) { k.disabled = true; }
              })

              this.turnos = resp.turn;
              this.cargandoT = false;
            }
          })
      })
  }

  cargarCombosDisponibles( id ) {
    this.cargandoB = true;
    this._comboService.cargarPlacesCombos(id)
      .subscribe( (resp: any) => {
        this.combos = resp.combos.filter(c => c.deleted != true);
        this.cargandoB = false;
      });
  }

  /*==================================
  =            Paginacion            =
  ==================================*/
  onChange(newValue: number) {
    this.desde = 0;
    this.hasta = newValue;
    this.setPage(1);
    //this.cargarUsuarios();
  }

  setPage(page: number, termino: string = '', hasta: number = this.hasta) {

    this.pager = this._pagerService.getPager(this.totalRegistros, page, hasta);
    this.desde = this.pager.startIndex;

    // get current page of items
    if (!termino) {
      this.cargando = true;
      this._consultaService.cargarConsultas( this.desde, hasta )
        .subscribe( (resp: any) => {
          this.consultas = resp.consultas.filter(c => !c.deleted);
          this.cargando = false;
        });
    }    

  }

  buscarDatos( termino: string ) {

    if ( termino.length <= 0 ) {
      this.cargarConsultas();
      return;
    }

    this.cargando = true;
    this._consultaService.buscarConsultas( termino )
      .subscribe( (consulta: Consulta[]) => {
        this.consultas = consulta;
        this.totalRegistros = consulta.length;
        this.setPage(1, termino);
        this.cargando = false;
      });
  }

  /*=====================================
  =            Nuevo Cliente            =
  =====================================*/
  nuevoCliente() {
    this.ngxSmartModalService.getModal('nuevoClienteModal').open();
  }

  guardarCliente() {

    if (!this.formaCliente.valid) {
      return
    }

    let cliente: Cliente = {
      nombre: this.formaCliente.value.nombre,
      apellido: this.formaCliente.value.apellido,
      telefono: this.formaCliente.value.telefono,
      email: this.formaCliente.value.email,
      direccion: this.formaCliente.value.direccion,
      detalles: this.formaCliente.value.detalles
    }
    
    this._clientService.crearCliente( cliente )
      .subscribe( (resp: any) => {

        this.cargarClientes();

        swal({
          type: 'success',
          title: '¡Cliente creado!',
          text: '',
          showConfirmButton: false,
          timer: 2000
        });

        this.ngxSmartModalService.getModal('nuevoClienteModal').close();

        this.forma.get('scliente').setValue(resp._id);
        //this.cargarConsultas();
      })
  }
  
  /*=========================================
  =            Nuevo Homenajeado            =
  =========================================*/
  nuevoHomenajeado( parent_id ) {
    this.ngxSmartModalService.getModal('nuevoHomenajeadoModal').open();
    this.formaHomenajeado.get('parent').setValue(parent_id);
  }

  guardarHomenajeado() {

    if (!this.formaHomenajeado.valid) {
      return
    }

    let homenajeado: Homenajeado = {
      parent: this.formaHomenajeado.value.parent,
      nombre: this.formaHomenajeado.value.nombre,
      apellido: this.formaHomenajeado.value.apellido,
      nacimiento: this.formaHomenajeado.value.nacimiento,
      genero: this.formaHomenajeado.value.genero,
      colegio: this.formaHomenajeado.value.colegio
    }
    
    this._clientService.crearHomenajeado( homenajeado )
      .subscribe( (resp: any) => {

        this.cargarHomenajeados(homenajeado.parent);
        swal({
          type: 'success',
          title: '¡Homenajeado creado!',
          text: '',
          showConfirmButton: false,
          timer: 2000
        });

        this.forma.get('shomenajeado').patchValue(resp._id);
        this.ngxSmartModalService.getModal('nuevoHomenajeadoModal').close();
      })
  }

  /*======================================
  =            Nueva Consulta            =
  ======================================*/
  nuevaConsulta() {

    if (!this.clientes.length) {
      this.cargarClientes();
      this.cargarLugares();
      //this.cargarCombos();
    }
    this.ngxSmartModalService.getModal('nuevaConsultaModal').open();
  }

  guardarConsulta() {

    if (!this.forma.valid) {
      return
    }

    let d = this.forma.value.consulta.date_c;
    //let date_c = moment.utc([d.year, d.month, d.day]).subtract(1, 'month').toISOString();
    let date_c = moment.utc(d.year + '-' + d.month + '-' + d.day, 'YYYY-MM-DD').toISOString();

    let consulta: Consulta = {
      client_c: this.forma.value.scliente,
      homenajeado_c: this.forma.value.shomenajeado,
      date_c: date_c,
      place_c: this.forma.value.consulta.place_c,
      medio_c: this.forma.value.consulta.medio_c,
      como_c: this.forma.value.consulta.como_c,
      detalles_c: this.forma.value.consulta.detalles_c,
      //date_t: this.forma.value.turno.date_t,
      //sena_t: this.forma.value.turno.sena_t,
      //place_t: this.forma.value.turno.place_t,
      //turno_t: this.forma.value.turno.turno_t,
      //combo_t: this.forma.value.turno.combo_t,
      //detalles_t: this.forma.value.turno.detalles_t,
    }

    //if (consulta.sena_t) {
    //  consulta.status = 'RESERVADO';
    //}

    this._consultaService.crearConsulta( consulta )
      .subscribe( (resp: any) => {

        swal({
          type: 'success',
          title: '¡Consulta creada!',
          text: '',
          showConfirmButton: false,
          timer: 2000
        });

        this.ngxSmartModalService.getModal('nuevaConsultaModal').close();
        this.cargarConsultas();
      })
  }

  /*===============================================
  =            ng-select custom search            =
  ===============================================*/
  // buscar cliente por nombre y apellido en form
  customSearchFn(term: string, cliente: Cliente) {
    term = term.toLocaleLowerCase();
    let result = cliente.nombre.toLocaleLowerCase().indexOf(term) > -1;
    if (cliente.apellido == null ) {
      result = cliente.nombre.toLocaleLowerCase().indexOf(term) > -1 || cliente.apellido.toLocaleLowerCase().indexOf(term) > -1;
    } else if (cliente.apellido) {
      result = cliente.nombre.toLocaleLowerCase().indexOf(term) > -1 || cliente.apellido.toLocaleLowerCase().indexOf(term) > -1;
    } else {
      result = cliente.nombre.toLocaleLowerCase().indexOf(term) > -1;
    }
    return result;
  }

  /*=====================================
  =            Agendar Turno            =
  =====================================*/
  agendarTurno( data ) {

    if (!this.places_c.length || !this.places_t.length) {
      this.cargarClientes();
      this.cargarLugares();
      //this.cargarCombos();
    }

    this.ngxSmartModalService.getModal('vcM').close();
    this.ngxSmartModalService.getModal('nuevoTurnoModal').open();
    this.ngxSmartModalService.setModalData(data, 'nuevoTurnoModal');

    this.formaTurno.get('_id').patchValue(data._id);
  }

  guardarTurno() {

    if (!this.formaTurno.valid) {
      return
    }

    let combo = this.combos.find(c => c._id === this.formaTurno.value.combo_t);

    // fix ng-bootstrap datepiker months array (1 - 12)
    let d: any = this.formaTurno.value.date_t;
    let date_format = moment.utc(d.year + '-' + d.month + '-' + d.day, 'YYYY-MM-DD').toISOString();
    //date_format.month = date_format.month - 1;
    //date_format = moment.utc(date_format).toISOString();
    
    // provisorio
    let sena_t = this.formaTurno.value.sena_t;
    let t_tipo = this.formaTurno.value.t_tipo;
    let t_marca = this.formaTurno.value.t_marca;

    let the_consulta: any = this.consultas.find(c => c._id === this.formaTurno.value._id);
    the_consulta.date_t = date_format;
    the_consulta.place_t = this.formaTurno.value.place_t;
    the_consulta.turno_t = this.formaTurno.value.turno_t;
    the_consulta.combo_t = this.formaTurno.value.combo_t;
    the_consulta.sena_m = this.formaTurno.value.sena_m;
    the_consulta.detalles_t = this.formaTurno.value.detalles_t;

    console.log('date_format', date_format);
    console.log('the_consulta.date_t', the_consulta.date_t);
    //console.log('combo', combo);

    let the_mov: Caja;
    if (sena_t) {
      the_consulta.status = 'RESERVADO';
      //the_consulta.pago = [];
      //the_consulta.sena_date = moment().toDate().toISOString();
      the_consulta.to_pay = combo.price;
      the_consulta.balance = combo.price - sena_t;

      the_mov = {
        consulta: the_consulta._id,
        cliente: the_consulta.client_c._id,
        tipo: 'INGRESO',
        medio: the_consulta.sena_m,
        t_tipo: t_tipo,
        t_marca: t_marca,
        monto: sena_t,
        descuento: 0,
        extras: null,
        total: sena_t,
        detalles: 'SEÑA',
      }
    }

    // guardar la consulta
    console.log('the_consulta', the_consulta);
    console.log('the_mov', the_mov);
    this._cajaService.crearMovimiento( the_mov )
      .subscribe( (resp: any) => {

        the_consulta.pago.push(resp._id);
        console.log('the_consulta con pago', the_consulta);

        this._consultaService.actualizarConsulta( the_consulta )
          .subscribe( (resp: any) => {

            swal({
              type: 'success',
              title: '¡Turno reservado!',
              text: '',
              showConfirmButton: false,
              timer: 2000
            });
            this.ngxSmartModalService.getModal('nuevoTurnoModal').close();
            this.cargarConsultas();
          })
      })
  }

  /*====================================
  =            Ver Consulta            =
  ====================================*/
  verConsulta( id ) {
    let view_consulta = this.consultas.find(c => c._id === id);
    //console.log('view_consulta', view_consulta);
    this.ngxSmartModalService.getModal('vcM').open();
    this.ngxSmartModalService.setModalData( view_consulta, 'vcM' );
  }

  resetModal() {
    this.ngxSmartModalService.resetModalData('vcM');
  }

  borrarConsulta( consulta ) {

    swal({
      title: '¿Estas seguro?',
      text: 'Esta a punto de borrar la consulta',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si! Borrar',
      cancelButtonText: 'Cancelar'
    })
    .then( borrar => {
      if (borrar.value) {

        consulta.deleted = true;
        this._consultaService.actualizarConsulta( consulta )
          .subscribe( resp => {

            this.ngxSmartModalService.getModal('vcM').close();

            swal({
              type: 'success',
              title: '¡Listo!',
              text: 'Consulta Borrada',
              showConfirmButton: false,
              timer: 2000
            });

            this.cargarConsultas();
          });
      }
    });
  }
 
}