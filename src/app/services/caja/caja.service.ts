import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { URL_SERVICIOS } from '../../config/config';
import { Usuario, Caja } from '../../models/index.model';
import { UsuarioService } from '../usuario/usuario.service';

import { map } from 'rxjs/operators';
import swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class CajaService {

  usuario: Usuario;
  caja: Caja;
  token: string;

  constructor(
    public http: HttpClient,
    public _usuarioService: UsuarioService,
  ) { }

  cargarMovimientos( desde: number = 0, hasta: number = 5  ) {
    let url = URL_SERVICIOS + '/caja?desde=' + desde + '&hasta=' + hasta;
    url += '&token=' + this._usuarioService.token;
    return this.http.get(url);
  }

  cargarMovimientosConsulta( id ) {
    let url = URL_SERVICIOS + '/caja/consulta/' + id;
    return this.http.get(url);
  }

  crearMovimiento(caja: Caja) {
    let url = URL_SERVICIOS + '/caja?token=' + this._usuarioService.token;
    return this.http.post(url, caja).pipe(
      map((resp: any) => {

        /*swal({
          type: 'success',
          title: '¡Movimiento creado!',
          text: '',
          showConfirmButton: false,
          timer: 2000
        });*/
        return resp.caja;
        //return true;
      })
    )
  }

  actualizarMovimiento(caja: Caja) {

    let url = URL_SERVICIOS + '/caja/' + caja._id;
    url += '?token=' + this._usuarioService.token;

    return this.http.put(url, caja).pipe(
      map((resp: any) => {

        /*swal({
          type: 'success',
          title: '¡Movimiento actualizado!',
          text: '',
          showConfirmButton: false,
          timer: 2000
        });*/
        return true;
      })
    )
  }

  /*buscarMovimientos( termino: string ) {
    let url = URL_SERVICIOS + '/search/coleccion/caja/' + termino;
    return this.http.get( url ).pipe(
			map( (resp: any) => resp.caja)
    )
  }

  borrarMovimiento( id: string ) {

    let url = URL_SERVICIOS + '/caja/' + id + '?token=' + this._usuarioService.token;
    return this.http.delete( url ).pipe(
      map( resp => {
        swal({
          type: 'success',
          title: 'Movimientoo borrado',
          text: 'El lugar se ha eliminado correctamente',
          showConfirmButton: false,
          timer: 2000
        });
        return true;
      })
    )
  }*/

}