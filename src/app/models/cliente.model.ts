export class Cliente {
	
	constructor (
		public nombre:string,
		public apellido:string,
		public telefono:string,
		public email?:string,
		public direccion?:string,
		public homenajeados?:string,
		public detalles?:string,
		public img?:string,
		public role?:string,

		public deleted?:boolean,
		public _id?:string
	) { }
}

export class Homenajeado {
	
	constructor (
		public parent:string,
		public nombre:string,
		public apellido?:string,
		public nacimiento?:string,
		public genero?:string,
		public colegio?:string,

		public deleted?:boolean,
		public _id?:string
	) { }
}