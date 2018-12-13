import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UsuarioService } from '../usuario/usuario.service';

import swal from 'sweetalert2';

@Injectable()
export class VerificaTokenGuard implements CanActivate {

	constructor(
		public _usuarioService: UsuarioService,
		public router: Router
	) {}

  canActivate(): Promise<boolean> | boolean {

  	let token = this._usuarioService.token;
  	let payload = JSON.parse( atob( token.split('.')[1] ));
  	let expirado = this.expirado(payload.exp);

  	if (expirado) {

      swal({
        type: 'error',
        title: 'Sesion Expirada',
        showConfirmButton: false,
        timer: 2000
      });

      setTimeout(() => {
  		  this._usuarioService.logout();        
      }, 2000)

  		return false;
  	}

    return this.verificaRenueva(payload.exp);
  }

  verificaRenueva( fechaExp: number ): Promise<boolean> {

    //console.log('verificaRenueva');

  	return new Promise( ( resolve, reject) => {

  		let tokenExp = new Date( fechaExp * 1000 );
  		let ahora = new Date();

  		ahora.setTime( ahora.getTime() + (4 * 60 * 60 * 1000) );

  		if (tokenExp.getTime() > ahora.getTime()) {
  			//console.log('verificaRenueva true');
  			resolve(true);
  		} else {

  			this._usuarioService.renuevaToken()
  				.subscribe( ()=> {
            //console.log('verificaRenueva true 2');
  					resolve(true);
  				}, ()=> {
            //console.log('verificaRenueva false');
  					this._usuarioService.logout();
  					reject(false);
  				})
  		}

  		resolve(true);
  	});
  }

  expirado( fechaExp: number ) {

  	let ahora = new Date().getTime() / 1000;

  	if (fechaExp < ahora) {
      //console.log('expirado');
  		return true;
  	} else {
      //console.log('expirado 2');
  		return false;
  	}

  }

}