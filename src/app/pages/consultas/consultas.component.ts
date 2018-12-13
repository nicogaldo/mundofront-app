import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { UsuarioService, ConsultaService, ClientService, PlaceService, ComboService, TurnService, PagerService } from '../../services/service.index';
import { Usuario, Consulta, Cliente, Homenajeado, Place, Combo, Turn } from '../../models/index.model';

import { NgxSmartModalService } from 'ngx-smart-modal';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.component.html',
  styleUrls: ['./consultas.component.css']
})
export class ConsultasComponent implements OnInit {

  forma: FormGroup;
  formaCliente: FormGroup;
  formaHomenajeado: FormGroup;
  //form_nuevo = false;

  usuario: Usuario;
  consultas: Consulta[] = [];
  clientes: Cliente[] = [];
  cargandoC: boolean = true;
  homenajeados: Homenajeado[] = [];
  cargandoH: boolean = false;
  places: Place[] = [];
  cargandoP: boolean = false;
  combos: Combo[] = [];
  cargandoB: boolean = false;
  turnos: Turn[] = [];
  cargandoT: boolean = false;

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
		public _pagerService: PagerService,
		public ngxSmartModalService: NgxSmartModalService,
  ) {

  	this.forma = new FormGroup({
      'scliente': new FormControl(null),
      'shomenajeado': new FormControl({value: null, disabled: true}),

      'consulta': new FormGroup({
        'medio_c': new FormControl(null, Validators.required),
        'como_c': new FormControl(null, Validators.required),
        'place_c': new FormControl(null, Validators.required),
        'detalles_c': new FormControl(null),
      }),
      'turno': new FormGroup({
        'date_t': new FormControl(null),
        'place_t': new FormControl(null),
        'turno_t': new FormControl(null),
        'combo_t': new FormControl(null),
        'sena_t': new FormControl(null),
        'detalles_t': new FormControl(null),
      })
    })

    this.formaCliente = new FormGroup({
      'nombre': new FormControl(null, Validators.required),
      'apellido': new FormControl(null),
      'telefono': new FormControl(null),
      'email': new FormControl(null, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9._]+\.[a-z]{2,3}$')),
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

    this.forma.get('turno.place_t').valueChanges.subscribe( (id: string) => {

      if (!id) {
        this.forma.get('turno.turno_t').disable();
      } else {
        this.forma.get('turno.turno_t').enable();
        this.cargarTurnosDisponibles(id);        
      }
    })

    /*=========================================
    =             Valid Date Turno            =
    =========================================*/
    this.forma.get('turno.date_t').valueChanges.subscribe( (date: string) => {
      if (date != null) {
        this.forma.get('turno.sena_t').setValidators(Validators.required);
        this.forma.get('turno.place_t').setValidators(Validators.required);
        this.forma.get('turno.combo_t').setValidators(Validators.required);
        this.forma.get('turno.turno_t').setValidators(Validators.required);
      } else if (date === null) {
        this.forma.get('turno.sena_t').clearValidators();
        this.forma.get('turno.place_t').clearValidators();
        this.forma.get('turno.combo_t').clearValidators();
        this.forma.get('turno.turno_t').clearValidators();
        this.forma.get('turno.sena_t').patchValue(null);
        this.forma.get('turno.place_t').patchValue(null);
        this.forma.get('turno.combo_t').patchValue(null);
      }
      this.forma.get('turno.sena_t').updateValueAndValidity();
      this.forma.get('turno.place_t').updateValueAndValidity();
      this.forma.get('turno.combo_t').updateValueAndValidity();
      this.forma.get('turno.turno_t').updateValueAndValidity();
    })

  }

  ngOnInit() {
    this.pager.currentPage = 1;
    this.cargarConsultas();
		//this.cargarCombos();
  }

  /*====================================
  =            Cargar Datos            =
  ====================================*/
  cargarConsultas() {
    this.cargando = true;
    this._consultaService.cargarConsultas( this.desde, this.hasta )
      .subscribe( (resp: any) => {
        this.consultas = resp.consultas.filter(c => c.deleted != true && c.medio_c != null);
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
        this.places = resp.places.filter(p => p.deleted != true);
        this.cargandoP = false;
      });
  }

  cargarTurnosDisponibles( id ) {
    this.cargandoT = true;
    this._turnService.cargarPlacesTurns(id)
      .subscribe( (resp: any) => {
        this.turnos = resp.turn;
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

    this.pager = this._pagerService.getPager(this.totalRegistros, page, this.hasta);
    this.desde = this.pager.startIndex;

    // get current page of items
    if (!termino) {
      this.cargando = true;
      this._consultaService.cargarConsultas( this.desde, this.hasta )
        .subscribe( (resp: any) => {
          this.consultas = resp.consultas.filter(c => c.deleted != true && c.medio_c != null);
          console.log(this.consultas);
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
    this.cargarClientes();
    this.cargarLugares();
    this.cargarCombos();
    this.ngxSmartModalService.getModal('nuevaConsultaModal').open();
  }

  guardarConsulta() {

    if (!this.forma.valid) {
      return
    }

    let consulta: Consulta = {
      client_c: this.forma.value.scliente,
      homenajeado_c: this.forma.value.shomenajeado,
      place_c: this.forma.value.consulta.place_c,
      medio_c: this.forma.value.consulta.medio_c,
      como_c: this.forma.value.consulta.como_c,
      detalles_c: this.forma.value.consulta.detalles_c,
      date_t: this.forma.value.turno.date_t,
      sena_t: this.forma.value.turno.sena_t,
      place_t: this.forma.value.turno.place_t,
      turno_t: this.forma.value.turno.turno_t,
      combo_t: this.forma.value.turno.combo_t,
      detalles_t: this.forma.value.turno.detalles_t,
    }

    if (consulta.sena_t) {
      consulta.status = 'RESERVADO';
    }

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

  /*====================================
  =            Ver Consulta            =
  ====================================*/
  verConsulta( id ) {
    let the_consulta = this.consultas.find(c => c._id === id);
    console.log(the_consulta);
    this.ngxSmartModalService.getModal('vcM').open();
    this.ngxSmartModalService.setModalData( the_consulta, 'vcM' );
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