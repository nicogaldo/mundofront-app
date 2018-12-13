import { Component, OnInit } from '@angular/core';

import { UsuarioService } from '../../services/service.index';
import { Usuario } from '../../models/index.model';

import swal from 'sweetalert2';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

	usuario: Usuario;

	imagenSubir: File;
	imagenTemp: any;

	constructor(public _usuarioService: UsuarioService) { }

	ngOnInit() {
		this.usuario = this._usuarioService.usuario;

	}

	guardar(usuario: Usuario) {

		this.usuario.nombre = usuario.nombre;

		this._usuarioService.actualizarUsuario(this.usuario)
			.subscribe()
	}

	seleccionImagen(archivo: File) {

		if (!archivo) {
			this.imagenSubir = null;
			return;
		}

		if (archivo.type.indexOf('image') < 0) {
			swal('Sólo imágenes', 'El archivo seleccionado no es una imagen', 'error');
			this.imagenSubir = null;
			return;
		}

		this.imagenSubir = archivo;

		let reader = new FileReader();
		let urlImagenTemp = reader.readAsDataURL(archivo);

		reader.onloadend = () => this.imagenTemp = reader.result;

	}

	cambiarImagen() {

		this._usuarioService.cambiarImagen(this.imagenSubir, this.usuario._id);

	}

}
