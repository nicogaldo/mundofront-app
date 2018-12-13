import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { UsuarioService, ClientService, PagerService } from '../../services/service.index';
import { Usuario, Cliente, Homenajeado, Consulta } from '../../models/index.model';

import { NgxSmartModalService } from 'ngx-smart-modal';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit {

	usuario: Usuario;
	cliente: Cliente;
	homenajeados: Homenajeado[] = [];
  cargando: boolean = false;

  consultas: Consulta;
  cargandoC: boolean = false;

  formaEdit: FormGroup;
  formaH: FormGroup;

  titleModal: string;
  isEdit: boolean = false;

  constructor(
		public _usuarioService: UsuarioService,
		public _clientService: ClientService,
    public router: Router,
    public activatedRoute: ActivatedRoute,
		public ngxSmartModalService: NgxSmartModalService,
  ) {

    this.formaEdit = new FormGroup({
      '_id': new FormControl( null, Validators.required ),
      'nombre': new FormControl(null, Validators.required),
      'apellido': new FormControl(null),
      'telefono': new FormControl(null),
      'email': new FormControl(null, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9._]+\.[a-z]{2,3}$')),
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
				console.log(resp);
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
        this.cargandoC = false;
      })
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
  	console.log(cliente);

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
    console.log(the_h);
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
              text: 'Paciente Borrado',
              showConfirmButton: false,
              timer: 2000
            });

            this.cargarCliente(this.cliente._id);
          });
      }
    });
  }

}
