import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { UsuarioService, ExtraService, PlaceService, PagerService } from '../../services/service.index';
import { Usuario, Extra, Place } from '../../models/index.model';

import { NgxSmartModalService } from 'ngx-smart-modal';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
  selector: 'app-extras',
  templateUrl: './extras.component.html',
  styleUrls: ['./extras.component.css']
})
export class ExtrasComponent implements OnInit {

  forma: FormGroup;
  formaEdit: FormGroup;
  formaExtraEdit: FormGroup;
  titleModal: string;
  isEdit: boolean = false;

	extras: Extra[] = [];
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
		public _extraService: ExtraService,
		public _placeService: PlaceService,
		public _pagerService: PagerService,
		public ngxSmartModalService: NgxSmartModalService,
  ) {

    this.forma = new FormGroup({
      'name': new FormControl( null, Validators.required ),
      'place': new FormControl( null, Validators.required ),
      'desc': new FormControl( null ),
      'price': new FormControl( null, Validators.required ),
    })

    this.formaEdit = new FormGroup({
      '_id': new FormControl( null, Validators.required ),
      'name': new FormControl( null, Validators.required ),
      'place': new FormControl( null, Validators.required ),
      'desc': new FormControl( null ),
      'price': new FormControl( null, Validators.required ),
    })

    this.forma.get('place').valueChanges.subscribe( (value: any[]) => {
      console.log(value);
      if (value && value.length > 1 && value.includes('all')) {
        this.forma.get('place').setValue(['all']);
        this.forma.get('place').updateValueAndValidity;
      }
    })

    this.formaEdit.get('place').valueChanges.subscribe( (value: any[]) => {
      console.log(value);
      if (value && value.length > 1 && value.includes('all')) {
        this.formaEdit.get('place').setValue(['all']);
        this.formaEdit.get('place').updateValueAndValidity;
      }
    })
  }

  ngOnInit() {
  	this.pager.currentPage = 1;
  	this.cargarExtras();
  }

  /*======================================
  =            Cargar Lugares            =
  ======================================*/
  cargarLugares() {
		this.cargandoL = true;
  	this._placeService.cargarPlaces( 0, 0 )
  		.subscribe( (resp: any) => {
  			this.places = resp.places;
        this.cargandoL = false;
  		});
  }

  /*======================================
  =            Cargar Extras            =
  ======================================*/
  cargarExtras() {

  	this._extraService.cargarExtras( this.desde, this.hasta )
  		.subscribe( (resp: any) => {
  			this.extras = resp.extras.filter( t => t.deleted === false);
        console.log(this.extras);
        this.totalRegistros = resp.total;
        this.cargando = false;

        this.setPage(1);
  		});
  }

  onChange(newValue: number) {
    this.desde = 0;
    this.hasta = newValue;
    this.setPage(1);
    //this.cargarExtras();
  }

  setPage(page: number, termino: string = '', hasta: number = this.hasta) {

  	this.pager = this._pagerService.getPager(this.totalRegistros, page, this.hasta);
  	this.desde = this.pager.startIndex;

    // get current page of items
    if (!termino) {
	    this._extraService.cargarExtras( this.desde, this.hasta )
	  		.subscribe( (resp: any) => {
	  			this.extras = resp.extras.filter( t => t.deleted === false);
	        this.cargando = false;
	  		});
    }    
  }

  buscarDatos( termino: string ) {

    if ( termino.length <= 0 ) {
      this.cargarExtras();
      return;
    }

    this.cargando = true;

    this._extraService.buscarExtras( termino )
      .subscribe( (extra: Extra[]) => {
      	this.extras = extra;
      	this.totalRegistros = extra.length;
      	this.setPage(1, termino);
        this.cargando = false;
      });
  }
  
  /*===================================
  =            Nuevo Extra            =
  ===================================*/
  nuevoExtra() {
    this.ngxSmartModalService.getModal('nuevoExtraModal').open();
    this.cargarLugares();
  }

  guardarExtra() {

  	if (!this.forma.valid) {
  		return
  	}

  	let extra: Extra = {
  		name: this.forma.value.name,
  		place: this.forma.value.place,
  		desc: this.forma.value.desc,
  		price:this.forma.value.price
  	}

    if (extra.place.includes('all')) {
      extra.place = null;
    }

    this._extraService.crearExtra( extra )
      .subscribe( (resp: any) => {
        this.ngxSmartModalService.getModal('nuevoExtraModal').close();
        this.cargarExtras();
			})
  }

  /*====================================
  =           Editar Extra           =
  ====================================*/
  verExtra( id ) {
    this.cargarLugares();
    this.ngxSmartModalService.getModal('editarExtraModal').open();
    this.titleModal = "Viendo Extra";
    this.isEdit = false;

    let extra: any = this.extras.find( c => c._id === id);
    let the_place;
    if (!extra.place) {
      the_place = ['all'];
    } else {
      the_place = extra.place.map( p => p._id);
    }

    this.formaEdit.patchValue({
      _id: extra._id,
      name: extra.name,
      place: the_place,
      desc: extra.desc,
      price: extra.price
    });

    this.ngxSmartModalService.setModalData(extra, 'editarExtraModal');

    this.formaEdit.get('_id').disable();
    this.formaEdit.get('name').disable();
    this.formaEdit.get('place').disable();
    this.formaEdit.get('desc').disable();
    this.formaEdit.get('price').disable();
  }

  editarExtra() {
    //this.isEdit = true;
    if (this.isEdit) {
      this.titleModal = "Editando Extra";
      this.formaEdit.get('_id').enable();
      this.formaEdit.get('name').enable();
      this.formaEdit.get('place').enable();
      this.formaEdit.get('desc').enable();
      this.formaEdit.get('price').enable();

    } else {
      this.titleModal = "Viendo Extra";
      this.formaEdit.get('_id').disable();
      this.formaEdit.get('name').disable();
      this.formaEdit.get('place').disable();
      this.formaEdit.get('desc').disable();
      this.formaEdit.get('price').disable();
    }
  }

  actualizarExtra( extra: Extra ) {

    if (extra.place.includes('all')) {
      extra.place = null;
    }

    this._extraService.actualizarExtra( extra )
      .subscribe( (resp:any) => {
        this.ngxSmartModalService.getModal('editarExtraModal').close();
        this.setPage(1);
        this.isEdit = false;
      });
  }

  removeData() {
    this.formaEdit.reset();
    this.ngxSmartModalService.resetModalData('editarExtraModal');
  }

  borrarExtra( horario: Extra ) {

    horario.deleted = true;

    swal({
      title: '¿Estas seguro?',
      text: 'Esta a punto de borrar un extra',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Borrar',
      cancelButtonText: 'Cancelar'
    })
      .then(borrar => {
        if (borrar.value) {

          this._extraService.actualizarExtra(horario)
            .subscribe(resp => {

              this.ngxSmartModalService.getModal('editarExtraModal').close();
              swal({
                type: 'success',
                title: '¡Listo!',
                text: 'Extra Borrado',
                showConfirmButton: false,
                timer: 2000
              });

              this.cargarExtras();
            });
        }
      });
  }
  
}
