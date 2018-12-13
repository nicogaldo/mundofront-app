import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Usuario, Turn } from '../../models/index.model';
import { URL_SERVICIOS } from '../../config/config';

import { map } from 'rxjs/operators';
import swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class TurnService {

	usuario: Usuario;
  turno: Turn;
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

  cargarTurns( desde: number = 0, hasta: number = 5  ) {
    let url = URL_SERVICIOS + '/turn?desde=' + desde + '&hasta=' + hasta;
    url += '&token=' + this.token;
    return this.http.get(url);
  }

  cargarPlacesTurns( id ) {
    let url = URL_SERVICIOS + '/turn/places/' + id;
    url += '?token=' + this.token;
    return this.http.get(url);
  }

  crearTurn(turn: Turn) {
    let url = URL_SERVICIOS + '/turn?token=' + this.token;
    return this.http.post(url, turn).pipe(
      map((resp: any) => {

        swal({
          type: 'success',
          title: '¡Turno creado!',
          text: '',
          showConfirmButton: false,
          timer: 2000
        });
        return resp.turn;
      })
    )
  }

  actualizarTurn(turn: Turn) {

    let url = URL_SERVICIOS + '/turn/' + turn._id;
    url += '?token=' + this.token;

    return this.http.put(url, turn).pipe(
      map((resp: any) => {
        /*swal({
          type: 'success',
          title: '¡Turno actualizado!',
          text: '',
          showConfirmButton: false,
          timer: 2000
        });*/
        return true;
      })
    )
  }


  buscarTurns( termino: string ) {
    let url = URL_SERVICIOS + '/search/coleccion/turn/' + termino;
    return this.http.get( url ).pipe(
			map( (resp: any) => resp.turn)
    )
  }

  borrarTurn( id: string ) {

    let url = URL_SERVICIOS + '/turn/' + id + '?token=' + this.token;

    return this.http.delete( url ).pipe(
      map( resp => {
        swal({
          type: 'success',
          title: 'Turno borrado',
          text: 'El lugar se ha eliminado correctamente',
          showConfirmButton: false,
          timer: 2000
        });
        return true;
      })
    )
  }

}