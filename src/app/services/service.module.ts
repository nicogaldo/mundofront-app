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
  MomentDateFormatter,
  I18n,
  CustomDatepickerI18n,
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
    MomentDateFormatter,
    I18n,
    CustomDatepickerI18n,
  ],
  declarations: []
})
export class ServiceModule { }