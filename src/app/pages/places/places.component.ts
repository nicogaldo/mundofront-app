import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { UsuarioService, PlaceService, PagerService } from '../../services/service.index';
import { Usuario, Place } from '../../models/index.model';

import { NgxSmartModalService } from 'ngx-smart-modal';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
  selector: 'app-places',
  templateUrl: './places.component.html',
  styleUrls: ['./places.component.css']
})
export class PlacesComponent implements OnInit {

  forma: FormGroup;
  formaEdit: FormGroup;
  formaTurnoEdit: FormGroup;
  titleModal: string;
  isEdit: boolean = false;

	places: Place[] = [];
  verDatos = '10 25 50 100'.split(' ');
  desde: number = 0;
  hasta: number = 10;
  pager: any = [];
  totalRegistros: number = 0;
  cargando: boolean = true;

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
		public _placeService: PlaceService,
		public _pagerService: PagerService,
		public ngxSmartModalService: NgxSmartModalService,
  ) {

    this.forma = new FormGroup({
      'name': new FormControl( null, Validators.required ),
      'desc': new FormControl( null ),
      'color1': new FormControl( null ),
    })

    this.formaEdit = new FormGroup({
      '_id': new FormControl( null, Validators.required ),
      'name': new FormControl( null, Validators.required ),
      'desc': new FormControl( null ),
      'color1': new FormControl( null ),
    })
  }

  ngOnInit() {
  	this.pager.currentPage = 1;
  	this.cargarLugares();
  }

  /*======================================
  =            Cargar Lugares            =
  ======================================*/
  cargarLugares() {

  	this._placeService.cargarPlaces( this.desde, this.hasta )
  		.subscribe( (resp: any) => {
  			this.places = resp.places.filter(p => !p.deleted);

        this.totalRegistros = resp.total;
        this.cargando = false;
        this.setPage(1);
  		})
  }

  onChange(newValue: number) {
    this.desde = 0;
    this.hasta = newValue;
    this.setPage(1);
    //this.cargarLugares();
  }

  setPage(page: number, termino: string = '', hasta: number = this.hasta) {

  	this.pager = this._pagerService.getPager(this.totalRegistros, page, this.hasta);
  	this.desde = this.pager.startIndex;

    // get current page of items
    if (!termino) {
	    this._placeService.cargarPlaces( this.desde, this.hasta )
	  		.subscribe( (resp: any) => {
	  			this.places = resp.places.filter(p => !p.deleted);

          this.places.map( p => {
            if (p.color1) {
              p.color1 = this.colors.find(c => c.id == p.color1)
            }
          })

	        this.cargando = false;
	  		});
    }    
  }

  buscarDatos( termino: string ) {

    if ( termino.length <= 0 ) {
      this.cargarLugares();
      return;
    }

    this.cargando = true;

    this._placeService.buscarPlaces( termino )
      .subscribe( (place: Place[]) => {
      	this.places = place;
      	this.totalRegistros = place.length;
      	this.setPage(1, termino);
        this.cargando = false;
      });
  }
  
  /*===================================
  =            Nuevo Lugar            =
  ===================================*/
  nuevoLugar() {
    this.ngxSmartModalService.getModal('nuevoLugarModal').open();
  }

  guardarLugar() {

  	if (!this.forma.valid) {
  		return
  	}

  	let lugar: Place = {
  		name: this.forma.value.name,
  		desc: this.forma.value.desc,
      color1: this.forma.value.color1,
  	}
    
    this._placeService.crearPlace( lugar )
      .subscribe( (resp: any) => {

        this.ngxSmartModalService.getModal('nuevoLugarModal').close();
        this.cargarLugares();
			})
  }

  /*====================================
  =            Editar Lugar            =
  ====================================*/
  verLugar( id ) {
    this.ngxSmartModalService.getModal('editarLugarModal').open();
    this.titleModal = "Viendo Lugar";
    this.isEdit = false;

    let place = this.places.find( p => p._id === id);
    let mycolor: any;

    if (place.color1) {
      mycolor = place.color1.id;
    } else {
      mycolor = null;
    }

    this.formaEdit.patchValue({
      _id: place._id,
      name: place.name,
      desc: place.desc,
      color1: mycolor
    });

    this.ngxSmartModalService.setModalData(place, 'editarLugarModal');

    this.formaEdit.get('_id').disable();
    this.formaEdit.get('name').disable();
    this.formaEdit.get('desc').disable();
    this.formaEdit.get('color1').disable();
  }

  editarLugar() {
    //this.isEdit = true;
    if (this.isEdit) {
      this.titleModal = "Editando Lugar";
      this.formaEdit.get('_id').enable();
      this.formaEdit.get('name').enable();
      this.formaEdit.get('desc').enable();
      this.formaEdit.get('color1').enable();

    } else {
      this.titleModal = "Viendo Lugar";
      this.formaEdit.get('_id').disable();
      this.formaEdit.get('name').disable();
      this.formaEdit.get('desc').disable();
      this.formaEdit.get('color1').disable();
    }
  }

  actualizarLugar( place: Place ) {
    this._placeService.actualizarPlace( place )
      .subscribe( (resp:any) => {
        this.ngxSmartModalService.getModal('editarLugarModal').close();
        this.setPage(1);
        this.isEdit = false;
      });
  }

  removeData() {
    this.formaEdit.reset();
    this.ngxSmartModalService.resetModalData('editarLugarModal');
  }

  borrarLugar( place: Place ) {

    place.deleted = true;

    swal({
      title: '¿Estas seguro?',
      text: 'Esta a punto de borrar un lugar',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Borrar',
      cancelButtonText: 'Cancelar'
    })
      .then(borrar => {
        if (borrar.value) {

          this._placeService.actualizarPlace(place)
            .subscribe(resp => {

              this.ngxSmartModalService.getModal('editarLugarModal').close();
              swal({
                type: 'success',
                title: 'Lugar borrado',
                text: 'El lugar se ha eliminado correctamente',
                showConfirmButton: false,
                timer: 2000
              });
              this.cargarLugares();
            });
        }
      });
  }
  
}