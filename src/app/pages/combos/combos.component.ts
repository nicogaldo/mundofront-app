import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { UsuarioService, ComboService, PlaceService, PagerService } from '../../services/service.index';
import { Usuario, Combo, Place } from '../../models/index.model';

import { NgxSmartModalService } from 'ngx-smart-modal';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
  selector: 'app-combos',
  templateUrl: './combos.component.html',
  styleUrls: ['./combos.component.css']
})
export class CombosComponent implements OnInit {

  forma: FormGroup;
  formaEdit: FormGroup;
  formaComboEdit: FormGroup;
  titleModal: string;
  isEdit: boolean = false;

	combos: Combo[] = [];
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
		public _comboService: ComboService,
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
  	this.cargarCombos();
  }

  /*======================================
  =            Cargar Lugares            =
  ======================================*/
  cargarLugares() {
		this.cargandoL = true;
  	this._placeService.cargarPlaces( 0, 0 )
  		.subscribe( (resp: any) => {
  			this.places = resp.places.filter( p => !p.deleted);
        this.cargandoL = false;
  		});
  }

  /*======================================
  =            Cargar Combos            =
  ======================================*/
  cargarCombos() {

  	this._comboService.cargarCombos( this.desde, this.hasta )
  		.subscribe( (resp: any) => {
  			this.combos = resp.combos.filter( t => !t.deleted);
        console.log(this.combos);
        this.totalRegistros = resp.total;
        this.cargando = false;

        this.setPage(1);
  		});
  }

  onChange(newValue: number) {
    this.desde = 0;
    this.hasta = newValue;
    this.setPage(1);
    //this.cargarCombos();
  }

  setPage(page: number, termino: string = '', hasta: number = this.hasta) {

  	this.pager = this._pagerService.getPager(this.totalRegistros, page, this.hasta);
  	this.desde = this.pager.startIndex;

    // get current page of items
    if (!termino) {
	    this._comboService.cargarCombos( this.desde, this.hasta )
	  		.subscribe( (resp: any) => {
	  			this.combos = resp.combos.filter( t => !t.deleted);
	        this.cargando = false;
	  		});
    }    
  }

  buscarDatos( termino: string ) {

    if ( termino.length <= 0 ) {
      this.cargarCombos();
      return;
    }

    this.cargando = true;

    this._comboService.buscarCombos( termino )
      .subscribe( (combo: Combo[]) => {
      	this.combos = combo;
      	this.totalRegistros = combo.length;
      	this.setPage(1, termino);
        this.cargando = false;
      });
  }
  
  /*===================================
  =            Nuevo Combo            =
  ===================================*/
  nuevoCombo() {
    this.ngxSmartModalService.getModal('nuevoComboModal').open();
    this.cargarLugares();
  }

  guardarCombo() {

  	if (!this.forma.valid) {
  		return
  	}

  	let combo: Combo = {
  		name: this.forma.value.name,
  		place: this.forma.value.place,
  		desc: this.forma.value.desc,
  		price:this.forma.value.price
  	}
    
    if (combo.place.includes('all')) {
      combo.place = null;
    }

    this._comboService.crearCombo( combo )
      .subscribe( (resp: any) => {
        this.ngxSmartModalService.getModal('nuevoComboModal').close();
        this.cargarCombos();
			})
  }

  /*====================================
  =           Editar Combo           =
  ====================================*/
  verCombo( id ) {
    this.cargarLugares();
    this.ngxSmartModalService.getModal('editarComboModal').open();
    this.titleModal = "Viendo Combo";
    this.isEdit = false;

    let combo: any = this.combos.find( c => c._id === id);
    let the_combo;
    if (!combo.place) {
      the_combo = ['all'];
    } else {
      the_combo = combo.place.map( p => p._id);
    }

    this.formaEdit.patchValue({
      _id: combo._id,
  		name: combo.name,
  		place: the_combo,
  		desc: combo.desc,
  		price: combo.price
    });

    this.ngxSmartModalService.setModalData(combo, 'editarComboModal');

    this.formaEdit.get('_id').disable();
    this.formaEdit.get('name').disable();
    this.formaEdit.get('place').disable();
    this.formaEdit.get('desc').disable();
    this.formaEdit.get('price').disable();
  }

  editarCombo() {
    //this.isEdit = true;
    if (this.isEdit) {
      this.titleModal = "Editando Combo";
      this.formaEdit.get('_id').enable();
      this.formaEdit.get('name').enable();
      this.formaEdit.get('place').enable();
      this.formaEdit.get('desc').enable();
      this.formaEdit.get('price').enable();

    } else {
      this.titleModal = "Viendo Combo";
      this.formaEdit.get('_id').disable();
      this.formaEdit.get('name').disable();
      this.formaEdit.get('place').disable();
      this.formaEdit.get('desc').disable();
      this.formaEdit.get('price').disable();
    }
  }

  actualizarCombo( combo: Combo ) {

    if (combo.place.includes('all')) {
      combo.place = null;
    }

    this._comboService.actualizarCombo( combo )
      .subscribe( (resp:any) => {
        this.ngxSmartModalService.getModal('editarComboModal').close();
        this.setPage(1);
        this.isEdit = false;
      });
  }

  removeData() {
    this.formaEdit.reset();
    this.ngxSmartModalService.resetModalData('editarComboModal');
  }

  borrarCombo( horario: Combo ) {

    horario.deleted = true;

    swal({
      title: '¿Estas seguro?',
      text: 'Esta a punto de borrar un combo',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Borrar',
      cancelButtonText: 'Cancelar'
    })
      .then(borrar => {
        if (borrar.value) {

          this._comboService.actualizarCombo(horario)
            .subscribe(resp => {

              this.ngxSmartModalService.getModal('editarComboModal').close();
              swal({
                type: 'success',
                title: '¡Listo!',
                text: 'Combo Borrado',
                showConfirmButton: false,
                timer: 2000
              });
              
              this.cargarCombos();
            });
        }
      });
  }
  
}
