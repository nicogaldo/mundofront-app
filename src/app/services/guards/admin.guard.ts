import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

import { UsuarioService } from '../usuario/usuario.service';
import swal from 'sweetalert2';

@Injectable()
export class AdminGuard implements CanActivate {
  
	constructor(
		public _usuarioService: UsuarioService,
		public router: Router
	) { }

  canActivate() {

    let role = this._usuarioService.usuario.role;

  	if (role === 'ADMIN_ROLE' || role === 'MANAGER_ROLE' ) {

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

  	} else {
  		this.router.navigate(['/dashboard']);
  		return false;
  	}


  }

  verificaRenueva( fechaExp: number ): Promise<boolean> {

    //console.log('verificaRenueva');

    return new Promise( ( resolve, reject) => {

      let tokenExp = new Date( fechaExp * 1000 );
      let ahora = new Date();

      ahora.setTime( ahora.getTime() + (4 * 60 * 60 * 1000) );

      if (tokenExp.getTime() > ahora.getTime()) {
        resolve(true);
      } else {

        this._usuarioService.renuevaToken()
          .subscribe( ()=> {
            resolve(true);
          }, ()=> {
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
