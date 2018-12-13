import { NgModule } from '@angular/core';
import { ImagenPipe } from './imagen.pipe';
import { AgePipe } from './age.pipe';

@NgModule({
  imports: [ ],
  declarations: [
  	ImagenPipe,
  	AgePipe,
  ],
  exports: [
  	ImagenPipe,
  	AgePipe,
  ]
})
export class PipesModule { }
