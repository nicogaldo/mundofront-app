import { Pipe, PipeTransform } from '@angular/core';
import { URL_SERVICIOS } from '../config/config';

@Pipe({
	name: 'imagen'
})
export class ImagenPipe implements PipeTransform {

	transform(img: string, tipo: string = 'usuarios'): any {

		let url = URL_SERVICIOS + '/img';

		if (!img) {
			return url + '/usuarios/xxx';
		}

		switch (tipo) {
			case 'usuarios':
				url += '/usuarios/' + img;
				break;

			default:
				url += '/noexiste/imagen';
				break;
		}
		return url;

	}
}