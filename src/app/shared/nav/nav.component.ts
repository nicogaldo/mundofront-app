import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UsuarioService } from '../../services/service.index';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {

	usuario: Usuario;

	constructor(
		public _usuarioService:UsuarioService
  	) { }

	ngOnInit() {
		this.usuario = this._usuarioService.usuario;

	    //this._sidebar.cargarMenu();
		//console.log('this.usuario ' + this.usuario);
	  }
  }
