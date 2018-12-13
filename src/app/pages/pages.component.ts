import { Component, OnInit } from '@angular/core';

declare function init_plugins();
//declare var Unifato: any; 

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styles: []
})
export class PagesComponent implements OnInit {

  constructor() { }

  ngOnInit() {

  	init_plugins();
  	document.body.classList.remove('body-bg-full');
	  //document.body.classList.add('sidebar-light');

	  //Unifato.init();
  }

}
