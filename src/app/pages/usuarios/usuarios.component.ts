import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { UsuarioService, PagerService } from '../../services/service.index';
import { Usuario } from '../../models/index.model';

import { NgxSmartModalService } from 'ngx-smart-modal';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {

  forma: FormGroup;
  formaEdit: FormGroup;

  titleModal: string;
  isEdit: boolean = false;

	usuario: Usuario;
  usuarios: Usuario[] = [];
  verDatos = '10 25 50 100'.split(' ');
  desde: number = 0;
  hasta: number = 10;
  pager: any = [];
  totalRegistros: number = 0;
  cargando: boolean = true;

  constructor(
		public _usuarioService: UsuarioService,
		public _pagerService: PagerService,
		public ngxSmartModalService: NgxSmartModalService,
  ) {

    this.usuario = _usuarioService.usuario;

    this.forma = new FormGroup({
      'nombre': new FormControl( null, Validators.required ),
      'email': new FormControl( null, [ Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9._]+\.[a-z]{2,3}$') ] ),
      'password': new FormControl( '', [ Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}/) ] ),
      'role': new FormControl( 'USER_ROLE' )
    })

    this.formaEdit = new FormGroup({
      '_id': new FormControl( null, Validators.required ),
      'nombre': new FormControl( null, Validators.required ),
      'email': new FormControl( null, [ Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9._]+\.[a-z]{2,3}$') ] ),
      //'password': new FormControl( null ),
      'role': new FormControl( null ),
    })
  }

  ngOnInit() {
  	this.pager.currentPage = 1;
  	this.cargarUsuarios();
  }

  /*======================================
  =           Cargar Usuarios            =
  ======================================*/
  cargarUsuarios() {

  	this._usuarioService.cargarUsuarios( this.desde, this.hasta )
  		.subscribe( (resp: any) => {
  			this.usuarios = resp.usuarios;
        this.totalRegistros = resp.total;
        this.cargando = false;

        this.setPage(1);
  		});
  }

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
	    this._usuarioService.cargarUsuarios( this.desde, this.hasta )
	  		.subscribe( (resp: any) => {
	  			this.usuarios = resp.usuarios;
	        this.cargando = false;
	  		});
    }    
  }

  buscarDatos( termino: string ) {

    if ( termino.length <= 0 ) {
      this.cargarUsuarios();
      return;
    }

    this.cargando = true;

    this._usuarioService.buscarUsuario( termino )
      .subscribe( (usuario: Usuario[]) => {
      	this.usuarios = usuario;
      	this.totalRegistros = usuario.length;
      	this.setPage(1, termino);
        this.cargando = false;
      });
  }
  
  /*===================================
  =           Nuevo Usuario           =
  ===================================*/
  nuevoUsuario() {
    this.ngxSmartModalService.getModal('nuevoUsuarioModal').open();
  }

  guardarUsuario() {

  	if (!this.forma.valid) {
  		return
  	}

  	let usuario: Usuario = {
  		nombre: this.forma.value.nombre,
			email: this.forma.value.email,
			password: this.forma.value.password,
			role: this.forma.value.role,
      user_parent: this.usuario._id
  	}
    
    this._usuarioService.crearUsuario( usuario )
      .subscribe( (resp: any) => {

      	swal({
          type: 'success',
          title: 'Usuario creado',
          showConfirmButton: false,
          timer: 2000
        });

        this.ngxSmartModalService.getModal('nuevoUsuarioModal').close();
        this.cargarUsuarios();
			})
  }

  /*====================================
  =           Editar Usuario           =
  ====================================*/
  verUsuario( id ) {
    this.ngxSmartModalService.getModal('editarUsuarioModal').open();
    this.titleModal = "Viendo Usuario";
    this.isEdit = false;

    let usuario = this.usuarios.find( p => p._id === id);
    this.formaEdit.patchValue({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      role: usuario.role,
    });

    this.ngxSmartModalService.setModalData(usuario, 'editarUsuarioModal');

    this.formaEdit.get('_id').disable();
    this.formaEdit.get('nombre').disable();
    this.formaEdit.get('email').disable();
    this.formaEdit.get('role').disable();
  }

  editarUsuario() {
    //this.isEdit = true;
    if (this.isEdit) {
      this.titleModal = "Editando Usuario";
      this.formaEdit.get('_id').enable();
      this.formaEdit.get('nombre').enable();
      this.formaEdit.get('email').enable();
      this.formaEdit.get('role').enable();

    } else {
      this.titleModal = "Viendo Usuario";
      this.formaEdit.get('_id').disable();
      this.formaEdit.get('nombre').disable();
      this.formaEdit.get('email').disable();
      this.formaEdit.get('role').disable();
    }
  }

  actualizarUsuario( usuario: Usuario ) {
    this._usuarioService.actualizarUsuario( usuario )
      .subscribe( (resp:any) => {
        this.ngxSmartModalService.getModal('editarUsuarioModal').close();
        this.setPage(1);
        this.isEdit = false;
      });
  }

  removeData() {
    this.formaEdit.reset();
    this.ngxSmartModalService.resetModalData('editarUsuarioModal');
  }
  
}