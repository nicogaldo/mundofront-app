import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { UsuarioService, TurnService, PlaceService, PagerService } from '../../services/service.index';
import { Usuario, Turn, Place } from '../../models/index.model';

import { NgxSmartModalService } from 'ngx-smart-modal';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styles: []
})
export class PaymentsComponent implements OnInit {
	
  forma: FormGroup;
  formaEdit: FormGroup;
  formaHorarioEdit: FormGroup;
  titleModal: string;
  isEdit: boolean = false;

	turns: Turn[] = [];
  cargando: boolean = true;
	places: Place[] = [];
  cargandoL: boolean = true;

  verDatos = '10 25 50 100'.split(' ');
  desde: number = 0;
  hasta: number = 10;
  pager: any = [];
  totalRegistros: number = 0;

  constructor(
		public _usuarioService: UsuarioService,
		public _turnService: TurnService,
		public _placeService: PlaceService,
		public _pagerService: PagerService,
		public ngxSmartModalService: NgxSmartModalService,
  ) {

    this.forma = new FormGroup({
      'name': new FormControl( null, Validators.required ),
      'place': new FormControl( null, Validators.required ),
      'from': new FormControl( null, Validators.required ),
      'to': new FormControl( null, Validators.required ),
    })

    this.formaEdit = new FormGroup({
      '_id': new FormControl( null, Validators.required ),
      'name': new FormControl( null, Validators.required ),
      'place': new FormControl( null, Validators.required ),
      'from': new FormControl( null, Validators.required ),
      'to': new FormControl( null, Validators.required ),
    })
  }

  ngOnInit() {
  	this.pager.currentPage = 1;
  	this.cargarHorarios();
  }

  /*======================================
  =            Cargar Lugares            =
  ======================================*/
  cargarLugares() {
  	this._placeService.cargarPlaces( 0, 0 )
  		.subscribe( (resp: any) => {
  			this.places = resp.places.filter( p => !p.deleted);;
        this.cargandoL = false;
  		});
  }

  /*======================================
  =            Cargar Horarios            =
  ======================================*/
  cargarHorarios() {

  	this._turnService.cargarTurns( this.desde, this.hasta )
  		.subscribe( (resp: any) => {
  			this.turns = resp.turns.filter( t => !t.deleted);
        this.totalRegistros = resp.total;
        this.cargando = false;

        this.setPage(1);
  		});
  }

  onChange(newValue: number) {
    this.desde = 0;
    this.hasta = newValue;
    this.setPage(1);
    //this.cargarHorarios();
  }

  setPage(page: number, termino: string = '', hasta: number = this.hasta) {

  	this.pager = this._pagerService.getPager(this.totalRegistros, page, this.hasta);
  	this.desde = this.pager.startIndex;

    // get current page of items
    if (!termino) {
	    this._turnService.cargarTurns( this.desde, this.hasta )
	  		.subscribe( (resp: any) => {
	  			this.turns = resp.turns.filter( t => !t.deleted);
	        this.cargando = false;
	  		});
    }    
  }

  buscarDatos( termino: string ) {

    if ( termino.length <= 0 ) {
      this.cargarHorarios();
      return;
    }

    this.cargando = true;

    this._turnService.buscarTurns( termino )
      .subscribe( (turn: Turn[]) => {
      	this.turns = turn;
      	this.totalRegistros = turn.length;
      	this.setPage(1, termino);
        this.cargando = false;
      });
  }
  
  /*===================================
  =            Nuevo Horario            =
  ===================================*/
  nuevoHorario() {
    this.ngxSmartModalService.getModal('nuevoHorarioModal').open();
    this.cargarLugares();
  }

  guardarHorario() {

  	if (!this.forma.valid) {
  		return
  	}

    let from = moment.utc(this.forma.value.from, ["h:mm a"]).format('HH:mm');
    let to = moment.utc(this.forma.value.to, ["h:mm a"]).format('HH:mm');

  	let turno: Turn = {
  		name: this.forma.value.name,
  		place: this.forma.value.place,
  		from: from,
  		to: to
  	}
    
    this._turnService.crearTurn( turno )
      .subscribe( (resp: any) => {

        this.ngxSmartModalService.getModal('nuevoHorarioModal').close();
        this.cargarHorarios();
			})
  }

  /*====================================
  =           Editar Horario           =
  ====================================*/
  verHorario( id ) {
    this.cargarLugares();
    this.ngxSmartModalService.getModal('editarHorarioModal').open();
    this.titleModal = "Viendo Horario";
    this.isEdit = false;

    let turn: any = this.turns.find( t => t._id === id);
    this.formaEdit.patchValue({
      _id: turn._id,
  		name: turn.name,
  		place: turn.place._id,
  		from: turn.from,
  		to: turn.to
    });

    this.ngxSmartModalService.setModalData(turn, 'editarHorarioModal');

    this.formaEdit.get('_id').disable();
    this.formaEdit.get('name').disable();
    this.formaEdit.get('place').disable();
    this.formaEdit.get('from').disable();
    this.formaEdit.get('to').disable();
  }

  editarHorario() {
    //this.isEdit = true;
    if (this.isEdit) {
      this.titleModal = "Editando Horario";
      this.formaEdit.get('_id').enable();
      this.formaEdit.get('name').enable();
      this.formaEdit.get('place').enable();
      this.formaEdit.get('from').enable();
      this.formaEdit.get('to').enable();

    } else {
      this.titleModal = "Viendo Horario";
      this.formaEdit.get('_id').disable();
      this.formaEdit.get('name').disable();
      this.formaEdit.get('place').disable();
      this.formaEdit.get('from').disable();
      this.formaEdit.get('to').disable();
    }
  }

  actualizarHorario( turn: Turn ) {

    console.log(turn);

    this._turnService.actualizarTurn( turn )
      .subscribe( (resp:any) => {
        this.ngxSmartModalService.getModal('editarHorarioModal').close();
        this.setPage(1);
        this.isEdit = false;
      });
  }

  removeData() {
    this.formaEdit.reset();
    this.ngxSmartModalService.resetModalData('editarHorarioModal');
  }

  borrarHorario( horario: Turn ) {

    horario.deleted = true;

    swal({
      title: '¿Estas seguro?',
      text: 'Esta a punto de borrar un horario',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Borrar',
      cancelButtonText: 'Cancelar'
    })
      .then(borrar => {
        if (borrar.value) {

          this._turnService.actualizarTurn(horario)
            .subscribe(resp => {

              this.ngxSmartModalService.getModal('editarHorarioModal').close();
              swal({
                type: 'success',
                title: 'Horario borrado',
                text: 'El horario se ha eliminado correctamente',
                showConfirmButton: false,
                timer: 2000
              });
              this.cargarHorarios();
            });
        }
      });
  }
  
}