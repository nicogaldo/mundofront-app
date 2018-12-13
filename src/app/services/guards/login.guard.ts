import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class LoginGuard implements CanActivate {

	constructor(
    public _usuarioService: UsuarioService,
    public router: Router
	) { }

  canActivate() {

    if (this._usuarioService.estaLogeado()) {
      //console.log('pasa el guard');
      return true;
    } else {
      //console.log('bloqueado por el guard');
      this._usuarioService.logout();
      return false;
    }

  }
}
