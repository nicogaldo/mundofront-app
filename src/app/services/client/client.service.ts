import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { URL_SERVICIOS } from '../../config/config';
import { Usuario, Cliente, Homenajeado } from '../../models/index.model';
import { UsuarioService } from '../usuario/usuario.service';

import { map } from 'rxjs/operators';
import swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

	usuario: Usuario;
  cliente: Cliente;
  homenajeado: Homenajeado;
  token: string;

  constructor(
    public http: HttpClient,
    public _usuarioService: UsuarioService,
  ) { }

  /*================================
  =            Get data            =
  ================================*/
  cargarConsultasCliente( id ) {
    let url = URL_SERVICIOS + '/consulta/client/' + id;
    return this.http.get(url);
  }
  
  /*================================
  =            Clientes            =
  ================================*/
  cargarTotal() {
    let url = URL_SERVICIOS + '/cliente/get/total';
    url += '?token=' + this._usuarioService.token;
    return this.http.get(url);
  }

  cargarClientes( desde: number = 0, hasta: number = 0  ) {

    let url = URL_SERVICIOS + '/cliente?desde=' + desde + '&hasta=' + hasta + '&token=' + this._usuarioService.token;
    return this.http.get(url);
  }

  cargarCliente(id) {
    let url = URL_SERVICIOS + '/cliente/' + id;
    return this.http.get(url);
  }

  crearCliente(cliente: Cliente) {
    let url = URL_SERVICIOS + '/cliente?token=' + this._usuarioService.token;
    return this.http.post(url, cliente).pipe(
      map((resp: any) => {

        swal({
          type: 'success',
          title: '¡Cliente creado!',
          text: '',
          showConfirmButton: false,
          timer: 2000
        });
        return resp.cliente;
      })
    )
  }

  actualizarCliente(cliente: Cliente) {

    let url = URL_SERVICIOS + '/cliente/' + cliente._id;
    url += '?token=' + this._usuarioService.token;

    return this.http.put(url, cliente).pipe(
      map((resp: any) => {

        swal({
          type: 'success',
          title: '¡Cliente actualizado!',
          text: '',
          showConfirmButton: false,
          timer: 2000
        });
        return true;
      })
    )
  }

  buscarClientes( termino: string ) {
    let url = URL_SERVICIOS + '/search/coleccion/cliente/' + termino;
    return this.http.get( url ).pipe(
			map( (resp: any) => resp.cliente)
    )
  }

  borrarCliente( id: string ) {

    let url = URL_SERVICIOS + '/cliente/' + id + '?token=' + this._usuarioService.token;

    return this.http.delete( url ).pipe(
      map( resp => {
        swal({
          type: 'success',
          title: 'Cliente borrado',
          text: 'El clientee se ha eliminado correctamente',
          showConfirmButton: false,
          timer: 2000
        });
        return true;
      })
    )
  }

  /*===================================
  =            Homenajeado            =
  ===================================*/
  cargarHomenajeados( desde: number = 0, hasta: number = 0  ) {

    let url = URL_SERVICIOS + '/homenajeado?desde=' + desde + '&hasta=' + hasta + '&token=' + this._usuarioService.token;
    return this.http.get(url);
  }

  cargarHomenajeadosParent( id  ) {
    let url = URL_SERVICIOS + '/homenajeado/parent/' + id;
    return this.http.get(url);
  }

  crearHomenajeado(homenajeado: Homenajeado) {
    let url = URL_SERVICIOS + '/homenajeado?token=' + this._usuarioService.token;
    return this.http.post(url, homenajeado).pipe(
      map((resp: any) => {

        swal({
          type: 'success',
          title: '¡Homenajeado creado!',
          text: '',
          showConfirmButton: false,
          timer: 2000
        });
        return resp.homenajeado;
      })
    )
  }

  actualizarHomenajeado(homenajeado: Homenajeado) {

    let url = URL_SERVICIOS + '/homenajeado/' + homenajeado._id;
    url += '?token=' + this._usuarioService.token;

    return this.http.put(url, homenajeado).pipe(
      map((resp: any) => {

        swal({
          type: 'success',
          title: '¡Homenajeado actualizado!',
          text: '',
          showConfirmButton: false,
          timer: 2000
        });
        return true;
      })
    )
  }


  buscarHomenajeados( termino: string ) {
    let url = URL_SERVICIOS + '/search/coleccion/homenajeado/' + termino;
    return this.http.get( url ).pipe(
      map( (resp: any) => resp.homenajeado)
    )
  }

  borrarHomenajeado( id: string ) {

    let url = URL_SERVICIOS + '/homenajeado/' + id + '?token=' + this._usuarioService.token;

    return this.http.delete( url ).pipe(
      map( resp => {
        swal({
          type: 'success',
          title: 'Homenajeado borrado',
          text: 'El homenajeado se ha eliminado correctamente',
          showConfirmButton: false,
          timer: 2000
        });
        return true;
      })
    )
  }

}