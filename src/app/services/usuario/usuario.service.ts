import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { URL_SERVICIOS } from '../../config/config';
import { Usuario } from '../../models/usuario.model';
import { SubirArchivosService } from '../subir-archivos/subir-archivos.service';

import  {throwError as observableThrowError, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  error_msg: string;
  cargando: boolean = false;

  usuario: Usuario;
  token: string;
  menu: any[] = [];

  constructor(
    public http: HttpClient,
    public router: Router,
    public _subirArchivoService: SubirArchivosService
  ) {
    this.cargarStorage();
  }

  renuevaToken() {

    let url = URL_SERVICIOS + '/login/renuevatoken'
    url+= '?token=' + this.token;

    return this.http.get( url ).pipe(
      map( (resp: any)=> {

        this.token = resp.token;
        localStorage.setItem('token', this.token);

        return true;
      }),
      catchError( err => {
        swal({
          type: 'error',
          title: 'Sesion Expirada',
          showConfirmButton: false,
          timer: 2000
        });

        setTimeout(() => {
          this.logout();        
        }, 2000)
        //this.router.navigate(['/login']);
        return observableThrowError(err);
      }),)
  }

  estaLogeado() {
    return (this.token.length > 5) ? true : false;
  }

  cargarStorage() {

    if (localStorage.getItem('token')) {
      this.token = localStorage.getItem('token');
      this.usuario = JSON.parse(localStorage.getItem('usuario'));
      this.menu = JSON.parse(localStorage.getItem('menu'));

    } else {
      this.token = '';
      this.usuario = null;
      this.menu = [];

    }
  }

  guardarStorage(id: string, token: string, usuario: Usuario, menu: any) {

    localStorage.setItem('id', id);
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    localStorage.setItem('menu', JSON.stringify(menu));

    this.usuario = usuario;
    this.token = token;
    this.menu = menu;
  }

  logout() {
    
    this.cargando = false;

    this.token = '';
    this.usuario = null;
    this.menu = [];

    localStorage.removeItem('id');
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('menu');
    
    document.body.classList.add('body-bg-full');

    this.router.navigate(['/ingresar']);
    location.reload();
  }

  login(usuario: Usuario, recordar: boolean = false) {

    if (recordar) {
      localStorage.setItem('email', usuario.email);

    } else {
      localStorage.removeItem('email');
    }

    this.error_msg = null;
    this.cargando = true;

    let url = URL_SERVICIOS + '/login';
    return this.http.post(url, usuario).pipe(
      map((resp: any) => {
        this.guardarStorage(resp.id, resp.token, resp.usuario, resp.menu);

        return resp.usuario;
      }),
      catchError( err =>  {
        this.cargando = false;
        this.error_msg = err.error.mensaje;
        return observableThrowError(err);
        
      }),);
  }

  /*====================================
  =            ABM Usuarios            =
  ====================================*/
  crearUsuario(usuario: Usuario) {

    let url = URL_SERVICIOS + '/usuario';

    return this.http.post(url, usuario).pipe(
      map((resp: any) => {

        //swal('Usuario creado', usuario.email, 'success');
        return resp.usuario;
      }))
  }

  actualizarUsuario(usuario: Usuario) {

    let url = URL_SERVICIOS + '/usuario/' + usuario._id;
    url += '?token=' + this.token;

    return this.http.put(url, usuario).pipe(
      map((resp: any) => {

        if ( usuario._id === this.usuario._id ) {
          let usuarioDB: Usuario = resp.usuario;
          this.guardarStorage(usuarioDB._id, this.token, usuarioDB, resp.menu);
        }

        return true;
      }));

  }

  cambiarImagen(archivo: File, id: string) {

    this._subirArchivoService.subirArchivo(archivo, 'usuarios', id)
      .then((resp: any) => {


        //console.log(resp);
        this.usuario.img = resp.usuario.img;
        //swal('Imagen Actualizada', this.usuario.nombre, 'success');
        this.guardarStorage(id, this.token, this.usuario, this.menu);

      })
      .catch(resp => {
        //console.log(resp);
      });
  }

  cargarUsuario(id) {
    let url = URL_SERVICIOS + '/usuario/' + id;

    return this.http.get(url);
  }

  //cargarUsuarios( desde: number = 0 , hasta: number = 5 ) {
  cargarMisUsuarios( desde: number = 0 , hasta: number = 5 ) {
    let url = URL_SERVICIOS + '/usuario?desde=' + desde + '&hasta=' + hasta;
    url += '&token=' + this.token;

    console.log(url);

    return this.http.get(url);
  }

  buscarUsuario(termino: string) {

    let url = URL_SERVICIOS + '/busqueda/coleccion/usuarios/' + termino;
    return this.http.get(url).pipe(
      map((resp: any) => resp.usuarios));
  }

  borrarUsuario( id: string ) {

    let url = URL_SERVICIOS + '/usuario/' + id + '?token=' + this.token;

    return this.http.delete( url ).pipe(
      map( resp => {
        /*swal({
          type: 'success',
          title: 'Usuario borrado',
          text: 'El usuario se ha eliminado correctamente',
          showConfirmButton: false,
          timer: 2000
        });*/
        return true;
      }))
  }

}