export class Caja {
	
	constructor (
		public consulta:string,
		public cliente:string,
		public tipo:string,
		public medio:string,
		public monto:number,
		//pago con tarjeta
		public t_recargo?:string,
		public t_tipo?:string,
		public t_marca?:string,
		public t_cuotas?:number,
		
		public descuento?:number,
		public extras?:any,
		public total?:number,
		public detalles?:string,

		public deleted?:boolean,
		public _id?:string
	) { }
}