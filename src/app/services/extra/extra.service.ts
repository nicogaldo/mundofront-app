import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Usuario, Extra } from '../../models/index.model';
import { URL_SERVICIOS } from '../../config/config';

import { map } from 'rxjs/operators';
import swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ExtraService {

 	usuario: Usuario;
  extra: Extra;
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

  cargarExtras( desde: number = 0, hasta: number = 5  ) {
    let url = URL_SERVICIOS + '/extra?desde=' + desde + '&hasta=' + hasta;
    url += '&token=' + this.token;
    return this.http.get(url);
  }

  cargarPlacesExtras( id ) {
    let url = URL_SERVICIOS + '/extra/place/' + id ;
    url += '?token=' + this.token;
    return this.http.get(url);
  }

  crearExtra(extra: Extra) {
    let url = URL_SERVICIOS + '/extra?token=' + this.token;
    return this.http.post(url, extra).pipe(
      map((resp: any) => {

        swal({
          type: 'success',
          title: '¡Extra creado!',
          text: '',
          showConfirmButton: false,
          timer: 2000
        });
        return resp.extra;
      })
    )
  }

  actualizarExtra(extra: Extra) {

    let url = URL_SERVICIOS + '/extra/' + extra._id;
    url += '?token=' + this.token;

    return this.http.put(url, extra).pipe(
      map((resp: any) => {

        swal({
          type: 'success',
          title: '¡Extra actualizado!',
          showConfirmButton: false,
          timer: 2000
        });

        return true;
      })
    )
  }

  buscarExtras( termino: string ) {
    let url = URL_SERVICIOS + '/search/coleccion/extra/' + termino;
    return this.http.get( url ).pipe(
			map( (resp: any) => resp.extra)
    )
  }

  borrarExtra( id: string ) {

    let url = URL_SERVICIOS + '/extra/' + id + '?token=' + this.token;
    return this.http.delete( url ).pipe(
      map( resp => {
        swal({
          type: 'success',
          title: 'Extra borrado',
          text: 'El lugar se ha eliminado correctamente',
          showConfirmButton: false,
          timer: 2000
        });
        return true;
      })
    )
  }

}