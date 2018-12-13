import { Component, OnInit } from '@angular/core';
import { Router, ActivationEnd } from '@angular/router';
import { Title, Meta, MetaDefinition } from '@angular/platform-browser';

import { map, filter } from 'rxjs/operators';

@Component({
  selector: 'app-breadcrums',
  templateUrl: './breadcrums.component.html',
  styles: []
})
export class BreadcrumsComponent implements OnInit {

	title:string = '';

  constructor( 
  	private router:Router,
		public _title:Title,
		public _meta:Meta 
	) {

		this.getDataRoute()
			.subscribe( data=>{
				//console.log(data);
				this.title = data.pageTitle;
				this._title.setTitle(this.title+' • Mundo Front');

				let metaTag:MetaDefinition = {
					name: 'descripcion',
					content: this.title
				}
				this._meta.updateTag(metaTag);

		});

  }

  getDataRoute() {
  	return this.router.events.pipe(
  		filter( event => event instanceof ActivationEnd ),
  		filter( (event: ActivationEnd) => event.snapshot.firstChild === null ),).pipe(
  			map( (event: ActivationEnd) => event.snapshot.data )
  		)
  }

  ngOnInit() {
  }

}
