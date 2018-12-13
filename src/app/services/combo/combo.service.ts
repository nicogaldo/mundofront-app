import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Usuario, Combo } from '../../models/index.model';
import { URL_SERVICIOS } from '../../config/config';

import { map } from 'rxjs/operators';
import swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ComboService {

  usuario: Usuario;
  combo: Combo;
  token: string;

  constructor(
    public http: HttpClient
  ) {
    this.cargarStorage();
  }

  cargarStorage() {

    if (localStorage.getItem('token')) {
      this.token = localStorage.getItem('token');
      this.usuario = JSON.parse(localStorage.getItem('usuario'));

    } else {
      this.token = '';
      this.usuario = null;

    }
  }

  cargarCombos( desde: number = 0, hasta: number = 5  ) {
    let url = URL_SERVICIOS + '/combo?desde=' + desde + '&hasta=' + hasta;
    url += '&token=' + this.token;
    return this.http.get(url);
  }

  crearCombo(combo: Combo) {
    let url = URL_SERVICIOS + '/combo?token=' + this.token;
    return this.http.post(url, combo).pipe(
      map((resp: any) => {

        swal({
          type: 'success',
          title: '¡Combo creado!',
          text: '',
          showConfirmButton: false,
          timer: 2000
        });
        return resp.combo;
      })
    )
  }

  actualizarCombo(combo: Combo) {

    let url = URL_SERVICIOS + '/combo/' + combo._id;
    url += '?token=' + this.token;

    return this.http.put(url, combo).pipe(
      map((resp: any) => {

        /*swal({
          type: 'success',
          title: '¡Combo actualizado!',
          text: '',
          showConfirmButton: false,
          timer: 2000
        });*/
        return true;
      })
    )
  }

  buscarCombos( termino: string ) {
    let url = URL_SERVICIOS + '/search/coleccion/combo/' + termino;
    return this.http.get( url ).pipe(
			map( (resp: any) => resp.combo)
    )
  }

  borrarCombo( id: string ) {

    let url = URL_SERVICIOS + '/combo/' + id + '?token=' + this.token;
    return this.http.delete( url ).pipe(
      map( resp => {
        swal({
          type: 'success',
          title: 'Comboo borrado',
          text: 'El lugar se ha eliminado correctamente',
          showConfirmButton: false,
          timer: 2000
        });
        return true;
      })
    )
  }

}