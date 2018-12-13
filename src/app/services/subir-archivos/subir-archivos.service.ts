import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from '../../config/config';

import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubirArchivosService {

  constructor(
		private http: HttpClient
	) { }

	subirArchivo(archivo: File, tipo: string, id: string) {

		return new Promise((resolve, reject) => {

			let formData = new FormData();
			let xhr = new XMLHttpRequest();

			formData.append('imagen', archivo, archivo.name);

			xhr.onreadystatechange = function() {

				if (xhr.readyState === 4) {

					if (xhr.status === 200) {
						console.log('Imagen subida');
						resolve(JSON.parse(xhr.response));
					} else {
						console.log('Fallo la subida', reject(xhr.response));
						reject(xhr.response);
					}
				}
			};

			let url = URL_SERVICIOS + '/public/' + tipo + '/' + id;

			xhr.open('PUT', url, true);
			xhr.send(formData);
		});
	}

}
