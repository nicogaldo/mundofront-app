import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbDatepickerI18n, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';

import { UsuarioService, ClientService, ConsultaService, TurnService, PlaceService, ComboService, I18n, CustomDatepickerI18n, MomentDateFormatter } from '../../services/service.index';
import { Usuario, Cliente, Homenajeado, Consulta, Place, Combo } from '../../models/index.model';

import { NgxSmartModalService } from 'ngx-smart-modal';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css'],
  providers: [
    I18n,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: MomentDateFormatter },
  ]
})
export class ClientComponent implements OnInit {

	usuario: Usuario;
	cliente: Cliente;
	homenajeados: Homenajeado[] = [];
  cargando: boolean = false;

  consultas: Consulta[] = [];
  cargandoC: boolean = false;
  places_c: Place[] = [];
  places_t: Place[] = [];
  cargandoP: boolean = false;
  combos: Combo[] = [];
  cargandoB: boolean = false;
  //turnos: Turn[] = [];
  turnos: any[] = [];
  cargandoT: boolean = false;

  formaEdit: FormGroup;
  formaH: FormGroup;
  formaC: FormGroup;

  titleModal: string;
  isEdit: boolean = false;
  isTurno: boolean = false;
  isConsultaEdit: boolean = false;

  constructor(
		public _usuarioService: UsuarioService,
		public _clientService: ClientService,
    public _consultaService: ConsultaService,
    public _placeService: PlaceService,
    public _comboService: ComboService,
    public _turnService: TurnService,
    public router: Router,
    public activatedRoute: ActivatedRoute,
		public ngxSmartModalService: NgxSmartModalService,
  ) {

    this.formaEdit = new FormGroup({
      '_id': new FormControl( null, Validators.required ),
      'nombre': new FormControl(null, Validators.required),
      'apellido': new FormControl(null),
      'telefono': new FormControl(null),
      'email': new FormControl(null, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')),
      'detalles': new FormControl(null)
    })

    this.formaH = new FormGroup({
      '_id': new FormControl( null ),
      'parent': new FormControl(null, Validators.required),
      'nombre': new FormControl(null, Validators.required),
      'apellido': new FormControl(null),
      'nacimiento': new FormControl(null),
      'genero': new FormControl(null),
      'colegio': new FormControl(null)
    })

    this.formaC = new FormGroup({
      'consulta': new FormGroup({
        '_id': new FormControl(null, Validators.required),
        'medio_c': new FormControl(null, Validators.required),
        'como_c': new FormControl(null, Validators.required),
        'place_c': new FormControl(null, Validators.required),
        'date_c': new FormControl(null),
        'detalles_c': new FormControl(null),
      }),
      'turno': new FormGroup({
        'date_t': new FormControl(null),
        'place_t': new FormControl(null),
        'turno_t': new FormControl(null),
        'combo_t': new FormControl(null),
        'sena_t': new FormControl(null),
        'sena_m': new FormControl(null),
        'detalles_t': new FormControl(null),
      })
    })

    this.formaC.get('turno.place_t').valueChanges.subscribe( (id: string) => {
      if (!id) {
        this.formaC.get('turno.turno_t').disable();
      } else {
        this.formaC.get('turno.turno_t').enable();
        this.cargarTurnosDisponibles(id);
        this.cargarCombosDisponibles(id);
      }
    })

  }

  ngOnInit() {
    this.usuario = this._usuarioService.usuario;
    this.activatedRoute.params.subscribe( params => {
			let id = params['id'];
			this.cargarCliente(id);
		});
  }

  cargarCliente(id) {  	
		this._clientService.cargarCliente( id )
			.subscribe( (resp:any) => {
				this.cliente = resp.cliente;
				this.cargarHomenajeados();
			})
  }

  cargarHomenajeados() {
  	this._clientService.cargarHomenajeadosParent(this.cliente._id)
  		.subscribe((resp: any) => this.homenajeados = resp.homenajeados.filter(h => !h.deleted))
  }

  cargarConsultas() {
    this.cargandoC = true;
    this._clientService.cargarConsultasCliente( this.cliente._id )
      .subscribe((resp: any) => { 
        this.consultas = resp.consultas.filter(c => !c.deleted);
        console.log('this.consultas');
        console.log(this.consultas);
        this.cargandoC = false;
      })
  }

  cargarLugares() {
    this.cargandoP = true;
    this._placeService.cargarPlaces( 0 , 0)
      .subscribe( (resp: any) => {
        this.places_c = resp.places.filter(p => !p.deleted);
        this.places_t = resp.places.filter(p => !p.deleted && p.desc != '@all@');
        this.cargandoP = false;
      });
  }

  the_horarios: any[] = [];
  cargarTurnosDisponibles( id ) {
    this.cargandoT = true;
    this.the_horarios = [];

    this._turnService.cargarPlacesTurns(id)
      .subscribe( (resp: any) => {

        //console.log('this.formaC.value.turno.date_t');
        //console.log(this.formaC.value.turno.date_t);

        //check turno
        this._consultaService.cargarTurnosFecha( this.formaC.value.turno.date_t, id )
          .subscribe( (resp_c:any) => {

            let turnos_ocupados = resp_c.consultas;

            if (resp.turn.length > 0) {

              turnos_ocupados.map((i: any) => {

                let here = false;
                if (i._id === this.formaC.value.consulta._id) {
                  here = true;
                }

                if (i.status === 'RESERVADO') {
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

  /*====================================
  =           Editar Cliente           =
  ====================================*/
  editarCliente() {
    this.ngxSmartModalService.getModal('editarClienteModal').open();

    this.formaEdit.patchValue({
      _id: this.cliente._id,
  		nombre: this.cliente.nombre,
  		apellido: this.cliente.apellido,
  		telefono: this.cliente.telefono,
  		email: this.cliente.email,
  		detalles: this.cliente.detalles,
    });
  }

  actualizarCliente( cliente: Cliente ) {

  	cliente.role = this.cliente.role;
  	cliente.img = this.cliente.img;
  	//console.log(cliente);

    this._clientService.actualizarCliente( cliente )
      .subscribe( (resp:any) => {
        this.ngxSmartModalService.getModal('editarClienteModal').close();
        //modal en service
        this.cargarCliente(this.cliente._id);
      });
  }

  borrarCliente() {

    swal({
      title: '¿Estas seguro?',
      text: 'Esta a punto de borrar a ' + this.cliente.nombre,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si! Borrar',
      cancelButtonText: 'Cancelar'
    })
    .then( borrar => {
      if (borrar.value) {

        this.cliente.deleted = true;
        this._clientService.actualizarCliente( this.cliente )
          .subscribe( resp => {

            this.ngxSmartModalService.getModal('editarClienteModal').close();

            swal({
              type: 'success',
              title: '¡Listo',
              text: 'Paciente Borrado',
              showConfirmButton: false,
              timer: 2000
            });

            setTimeout(() => {
              this.router.navigate(['/clientes']);
            }, 2000);

          });
      }
    });
  }

  /*====================================
  =         Editar Homenajeado         =
  ====================================*/
  editarHomenajeado( id ) {

    this.isEdit = true;
    this.titleModal = 'Editar';
    this.ngxSmartModalService.getModal('editarHomenajeadoModal').open();

    let the_h = this.homenajeados.find(h => h._id === id);

    this.formaH.patchValue({
      _id: the_h._id,
      parent: the_h.parent,
  		nombre: the_h.nombre,
      apellido: the_h.apellido,
      nacimiento: the_h.nacimiento,
      genero: the_h.genero,
      colegio: the_h.colegio
    });
  }

  nuevoHomenajeado() {
    this.isEdit = false;
    this.titleModal = 'Nuevo';
    this.ngxSmartModalService.getModal('editarHomenajeadoModal').open();

    this.formaH.patchValue({
      parent: this.cliente._id,
    });
  }

  guardarHomenajeado( homenajeado: Homenajeado ) {

    if (this.isEdit) {
      
      this._clientService.actualizarHomenajeado( homenajeado )
        .subscribe( (resp:any) => {
          this.ngxSmartModalService.getModal('editarHomenajeadoModal').close();
          this.isEdit = false;
          //modal en service
          this.cargarCliente(this.cliente._id);
        });

    } else {

      this._clientService.crearHomenajeado( homenajeado )
        .subscribe( (resp:any) => {
          this.ngxSmartModalService.getModal('editarHomenajeadoModal').close();
          //modal en service
          this.cargarCliente(this.cliente._id);
        });
    }
  }

  borrarHomenajeado( homenajeado ) {

    swal({
      title: '¿Estas seguro?',
      text: 'Esta a punto de borrar a ' + homenajeado.nombre,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si! Borrar',
      cancelButtonText: 'Cancelar'
    })
    .then( borrar => {
      if (borrar.value) {

        homenajeado.deleted = true;
        this._clientService.actualizarHomenajeado( homenajeado )
          .subscribe( resp => {

            this.ngxSmartModalService.getModal('editarHomenajeadoModal').close();

            swal({
              type: 'success',
              title: '¡Listo',
              text: 'Cliente Borrado',
              showConfirmButton: false,
              timer: 2000
            });

            this.cargarCliente(this.cliente._id);
          });
      }
    });
  }

  /*=======================================
  =            Editar Consulta            =
  =======================================*/
  editarConsulta( id ) {

    this.cargarLugares();

    this.isConsultaEdit = true;
    this.ngxSmartModalService.getModal('editarConsultaModal').open();

    let the_c: any = this.consultas.find(c => c._id === id);

    this.formaC.patchValue({
      consulta: {
        _id: the_c._id,
        medio_c: the_c.medio_c,
        como_c: the_c.como_c,
        place_c: the_c.place_c._id,
        detalles_c: the_c.detalles_c,        
      }
    });

    if (the_c.date_c) {
      let dc = moment.utc(the_c.date_c).format('YYYY-MM-DD').split('-');
      this.formaC.patchValue({
        consulta: {
          date_c: {
            year: parseInt(dc[0]),
            month: parseInt(dc[1]),
            day: parseInt(dc[2])
          },
        }
      });
    }

    if (the_c.sena_t) {

      /*let d = moment.utc(the_c.date_t).format('DD-MM-YYYY').split('-');
      let date = {
        day: parseInt(d[0]),
        month: parseInt(d[1]),
        year: parseInt(d[2]),
      }*/

      let dt = moment.utc(the_c.date_t).format('YYYY-MM-DD').split('-');

      this.isTurno = true;
      this.formaC.patchValue({
        turno: {
          date_t: {
            year: parseInt(dt[0]),
            month: parseInt(dt[1]),
            day: parseInt(dt[2])
          },
          place_t: the_c.place_t._id,
          turno_t: the_c.turno_t._id,
          combo_t: the_c.combo_t._id,
          sena_t: the_c.sena_t,
          sena_m: the_c.sena_m,
          detalles_t: the_c.detalles_t,
        }
      })

      this.formaC.get('turno.sena_t').disable();
      this.formaC.get('turno.sena_m').disable();
    }
  }

  actualizarConsulta() {

    let d_c: any = this.formaC.value.consulta.date_c;
    let date_c_format = moment.utc(d_c.year + '-' + d_c.month + '-' + d_c.day, 'YYYY-MM-DD').toISOString();
    let d_t: any = this.formaC.value.turno.date_t;
    let date_t_format = moment.utc(d_t.year + '-' + d_t.month + '-' + d_t.day, 'YYYY-MM-DD').toISOString();

    let turno = this.consultas.find(c => c._id === this.formaC.value.consulta._id);

    let the_turno: Consulta = {
      _id: turno._id,
      client_c: this.formaC.value.consulta.client_c_id,
      homenajeado_c: this.formaC.value.consulta.homenajeado_c,
      medio_c: this.formaC.value.consulta.medio_c,
      como_c: this.formaC.value.consulta.como_c,
      place_c: this.formaC.value.consulta.place_c,
      date_c: date_c_format,
      detalles_c: this.formaC.value.consulta.detalles_c,
      date_t: date_t_format,
      place_t: this.formaC.value.turno.place_t,
      turno_t: this.formaC.value.turno.turno_t,
      combo_t: this.formaC.value.turno.combo_t,
      //sena_t: this.formaC.value.turno.sena_t,
      detalles_t: this.formaC.value.turno.detalles_t,
    }

    the_turno.client_c = turno.client_c;
    the_turno.homenajeado_c = turno.homenajeado_c;
    the_turno.status = turno.status;
    the_turno.deleted = turno.deleted;
    
    this._consultaService.actualizarConsulta( the_turno )
      .subscribe( resp => {

        this.ngxSmartModalService.getModal('editarConsultaModal').close();

        swal({
          type: 'success',
          title: 'Consulta actualizada',
          showConfirmButton: false,
          timer: 2000
        });

        this.cargarConsultas();
      });

  }

}
