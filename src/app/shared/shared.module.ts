import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NopagefoundComponent } from './nopagefound/nopagefound.component';
import { NavComponent } from './nav/nav.component';

import { PipesModule } from '../pipes/pipes.module';
import { SidebarComponent } from './sidebar/sidebar.component';
import { BreadcrumsComponent } from './breadcrums/breadcrums.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule,
		PipesModule,
	],
	declarations: [
    	NavComponent,
    	NopagefoundComponent,
    	SidebarComponent,
    	BreadcrumsComponent,
	],
	exports: [
    	NavComponent,
    	NopagefoundComponent,
    	SidebarComponent,
    	BreadcrumsComponent,
	]    
})
export class SharedModule { }