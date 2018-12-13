import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Usuario, Place } from '../../models/index.model';
import { URL_SERVICIOS } from '../../config/config';

import { map } from 'rxjs/operators';
import swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class PlaceService {

	usuario: Usuario;
  place: Place;
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

  cargarPlaces( desde: number = 0, hasta: number = 5  ) {

    let url = URL_SERVICIOS + '/place?desde=' + desde + '&hasta=' + hasta + '&token=' + this.token;
    return this.http.get(url);
  }

  crearPlace(place: Place) {
    let url = URL_SERVICIOS + '/place?token=' + this.token;
    return this.http.post(url, place).pipe(
      map((resp: any) => {

        swal({
          type: 'success',
          title: '¡Lugar creado!',
          text: '',
          showConfirmButton: false,
          timer: 2000
        });
        return resp.place;
      })
    )
  }

  actualizarPlace(place: Place) {

    let url = URL_SERVICIOS + '/place/' + place._id;
    url += '?token=' + this.token;

    return this.http.put(url, place).pipe(
      map((resp: any) => {

        swal({
          type: 'success',
          title: '¡Lugar actualizado!',
          text: '',
          showConfirmButton: false,
          timer: 2000
        });
        return true;
      })
    )
  }


  buscarPlaces( termino: string ) {
    let url = URL_SERVICIOS + '/search/coleccion/place/' + termino;
    return this.http.get( url ).pipe(
			map( (resp: any) => resp.place)
    )
  }

  borrarPlace( id: string ) {

    let url = URL_SERVICIOS + '/place/' + id + '?token=' + this.token;

    return this.http.delete( url ).pipe(
      map( resp => {
        swal({
          type: 'success',
          title: 'Lugar borrado',
          text: 'El lugar se ha eliminado correctamente',
          showConfirmButton: false,
          timer: 2000
        });
        return true;
      })
    )
  }

}