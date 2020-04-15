import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { URL_SERVICIOS } from '../../config/config';
import { Usuario, Consulta } from '../../models/index.model';
import { UsuarioService } from '../usuario/usuario.service';

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
    public http: HttpClient,
    public _usuarioService: UsuarioService,
  ) { }

  /*=================================
  =              Stats              =
  =================================*/
  cargarTotal() {
    let url = URL_SERVICIOS + '/consulta/get/total';
    url += '?token=' + this._usuarioService.token;
    return this.http.get(url);
  }

  cargarAno( anio, tipo = 'consultas' ) {
    let url = URL_SERVICIOS + '/consulta/ano/' + anio + '?tipo=' + tipo ;
    url += '&token=' + this._usuarioService.token;
    return this.http.get(url);
  }

  cargarRango( desde, hasta, tipo = 'consultas' ) {
    let url = URL_SERVICIOS + '/consulta/' + desde + '/' + hasta + '?tipo=' + tipo ;
    url += '&token=' + this._usuarioService.token;
    console.log('url', url);
    return this.http.get(url);
  }

  /*=================================
  =            Consultas            =
  =================================*/
  cargarConsultas( desde: number = 0, hasta: number = 5  ) {

    let url = URL_SERVICIOS + '/consulta?desde=' + desde + '&hasta=' + hasta + '&token=' + this._usuarioService.token;
    return this.http.get(url);
  }

  crearConsulta(consulta: Consulta) {
    let url = URL_SERVICIOS + '/consulta?token=' + this._usuarioService.token;
    return this.http.post(url, consulta).pipe(
      map((resp: any) => { return resp.consulta })
    )
  }

  actualizarConsulta(consulta: Consulta) {

    let url = URL_SERVICIOS + '/consulta/' + consulta._id;
    url += '?token=' + this._usuarioService.token;

    return this.http.put(url, consulta).pipe(
      map((resp: any) => {

        /*swal({
          type: 'success',
          title: '¡Consulta actualizada!',
          text: '',
          showConfirmButton: false,
          timer: 2000
        });*/
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

    let url = URL_SERVICIOS + '/consulta/' + id + '?token=' + this._usuarioService.token;

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
  cargarTurnosLugar( id, desc = '' ) {
    let url = URL_SERVICIOS + '/consulta/place/' + id + '/' + desc;
    url += '?token=' + this._usuarioService.token;
    return this.http.get(url);
  }

  cargarTurnosRango( desde, hasta ) {
    let url = URL_SERVICIOS + '/consulta/solo/turnos?desde=' + desde + '&hasta=' + hasta;
    url += '&token=' + this._usuarioService.token;
    return this.http.get(url);
  }

  cargarTurnosFecha( fecha, salon = '' ) {
    let url = URL_SERVICIOS + '/consulta/' + fecha.day + '/'+ fecha.month + '/' + fecha.year + '?place=' + salon;
    url += '&token=' + this._usuarioService.token;
    return this.http.get(url);
  }

}