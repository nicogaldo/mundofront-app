import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { UsuarioService, ClientService, PagerService } from '../../services/service.index';
import { Usuario, Cliente, Homenajeado } from '../../models/index.model';

import { NgxSmartModalService } from 'ngx-smart-modal';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: []
})
export class ClientsComponent {

  forma: FormGroup;
  formaEdit: FormGroup;
  //formaClienteEdit: FormGroup;
  titleModal: string;
  isEdit: boolean = false;

	clientes: Cliente[] = [];
  cargando: boolean = true;
	homenajeados: Homenajeado[] = [];
  cargandoH: boolean = true;

  verDatos = '10 25 50 100'.split(' ');
  desde: number = 0;
  hasta: number = 10;
  pager: any = [];
  totalRegistros: number = 0;

  constructor(
		public _usuarioService: UsuarioService,
		public _clientService: ClientService,
		public _pagerService: PagerService,
		public ngxSmartModalService: NgxSmartModalService,
  ) {

    this.forma = new FormGroup({
      'nombre': new FormControl(null, Validators.required),
      'apellido': new FormControl(null),
      'telefono': new FormControl(null),
      'email': new FormControl(null, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9._]+\.[a-z]{2,3}$')),
      'detalles': new FormControl(null)
    })
  }

  ngOnInit() {
  	this.pager.currentPage = 1;
  	this.cargarClientes();
  }

  /*======================================
  =            Cargar Lugares            =
  ======================================*/
  cargarHomenajeados() {
		this.cargandoH = true;
  	this._clientService.cargarHomenajeados( 0, 0 )
  		.subscribe( (resp: any) => {
  			this.homenajeados = resp.homenajeados;
        this.cargandoH = false;
  		});
  }

  /*======================================
  =            Cargar Clientes            =
  ======================================*/
  cargarClientes() {

  	this._clientService.cargarClientes( this.desde, this.hasta )
  		.subscribe( (resp: any) => {
        console.log(resp.clientes);
  			this.clientes = resp.clientes.filter(c => c.role === 'USER_ROLE' && c.deleted === false);
        this.totalRegistros = resp.total;
        this.cargando = false;

        this.setPage(1);
  		});
  }

  onChange(newValue: number) {
    this.desde = 0;
    this.hasta = newValue;
    this.setPage(1);
    //this.cargarClientes();
  }

  setPage(page: number, termino: string = '', hasta: number = this.hasta) {

  	this.pager = this._pagerService.getPager(this.totalRegistros, page, this.hasta);
  	this.desde = this.pager.startIndex;

    // get current page of items
    if (!termino) {
	    this._clientService.cargarClientes( this.desde, this.hasta )
	  		.subscribe( (resp: any) => {
	  			this.clientes = resp.clientes.filter( t => t.deleted === false);
	        this.cargando = false;
	  		});
    }    
  }

  buscarDatos( termino: string ) {

    if ( termino.length <= 0 ) {
      this.cargarClientes();
      return;
    }

    this.cargando = true;

    this._clientService.buscarClientes( termino )
      .subscribe( (cliente: Cliente[]) => {
      	this.clientes = cliente;
      	this.totalRegistros = cliente.length;
      	this.setPage(1, termino);
        this.cargando = false;
      });
  }
  
  /*===================================
  =            Nuevo Cliente            =
  ===================================*/
  nuevoCliente() {
    this.ngxSmartModalService.getModal('nuevoClienteModal').open();
    this.cargarHomenajeados();
  }

  guardarCliente() {

  	if (!this.forma.valid) {
  		return
  	}

  	let cliente: Cliente = {
  		nombre: this.forma.value.nombre,
  		apellido: this.forma.value.apellido,
  		telefono: this.forma.value.telefono,
  		email:this.forma.value.email,
  		detalles:this.forma.value.detalles,
  	}
    
    this._clientService.crearCliente( cliente )
      .subscribe( (resp: any) => {

        this.ngxSmartModalService.getModal('nuevoClienteModal').close();
        this.cargarClientes();
			})
  }
  
}
