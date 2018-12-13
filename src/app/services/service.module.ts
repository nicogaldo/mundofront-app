import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { 
  UsuarioService,
  LoginGuard,
  AdminGuard,
  VerificaTokenGuard,
  SidebarService,
  PagerService,
  SubirArchivosService,
} from './service.index';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  providers: [
    UsuarioService,
    LoginGuard,
    AdminGuard,
    VerificaTokenGuard,
    SidebarService,
    PagerService,
    SubirArchivosService,
  ],
  declarations: []
})
export class ServiceModule { }