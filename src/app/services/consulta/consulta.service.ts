import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Usuario, Consulta } from '../../models/index.model';
import { URL_SERVICIOS } from '../../config/config';

import { map } from 'rxjs/operators';
import swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ConsultaService {

	usuario: Usuario;
  consulta: Consulta;
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

  /*=================================
  =              Stats              =
  =================================*/
  cargarTotal() {
    let url = URL_SERVICIOS + '/consulta/get/total';
    url += '?token=' + this.token;
    return this.http.get(url);
  }

  cargarRango( mes, anio, tipo = 'consultas' ) {
    let url = URL_SERVICIOS + '/consulta/' + mes + '/' + anio + '?tipo=' + tipo ;
    url += '?token=' + this.token;
    return this.http.get(url); 
  }

  /*=================================
  =            Consultas            =
  =================================*/
  cargarConsultas( desde: number = 0, hasta: number = 5  ) {

    let url = URL_SERVICIOS + '/consulta?desde=' + desde + '&hasta=' + hasta + '&token=' + this.token;
    return this.http.get(url);
  }

  crearConsulta(consulta: Consulta) {
    let url = URL_SERVICIOS + '/consulta?token=' + this.token;
    return this.http.post(url, consulta).pipe(
      map((resp: any) => { return resp.consulta })
    )
  }

  actualizarConsulta(consulta: Consulta) {

    let url = URL_SERVICIOS + '/consulta/' + consulta._id;
    url += '?token=' + this.token;

    return this.http.put(url, consulta).pipe(
      map((resp: any) => {

        swal({
          type: 'success',
          title: '¡Consulta actualizada!',
          text: '',
          showConfirmButton: false,
          timer: 2000
        });
        return true;
      })
    )
  }

  buscarConsultas( termino: string ) {
    let url = URL_SERVICIOS + '/search/coleccion/consulta/' + termino;
    return this.http.get( url ).pipe(
			map( (resp: any) => resp.consulta)
    )
  }

  borrarConsulta( id: string ) {

    let url = URL_SERVICIOS + '/consulta/' + id + '?token=' + this.token;

    return this.http.delete( url ).pipe(
      map( (resp: any) => {
        swal({
          type: 'success',
          title: 'Consulta borrada',
          text: 'La consulta se ha eliminado correctamente',
          showConfirmButton: false,
          timer: 2000
        });
        return true;
      })
    )
  }

  /*==============================
  =            Turnos            =
  ==============================*/
  cargarTurnosLugar( id ) {
    let url = URL_SERVICIOS + '/consulta/place/' + id;
    url += '?token=' + this.token;
    return this.http.get(url);
  }

  cargarTurnos( desde = '2010-01-01' ) {
    let url = URL_SERVICIOS + '/consulta/solo/turnos?desde=' + desde;
    url += '&token=' + this.token;
    return this.http.get(url);
  }


}