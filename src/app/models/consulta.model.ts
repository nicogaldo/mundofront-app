export class Consulta {
	
	constructor (
		public homenajeado_c:string,
		public client_c:string,
		public date_c?:string,
		public place_c?:string,
		public medio_c?:string,
		public como_c?:string,
		public detalles_c?:string,

		public date_t?:string,
		//public sena_t?:number,
		//public sena_m?:string,
		//public sena_date?:string,
		public place_t?:string,
		public turno_t?:string,
		public combo_t?:string,
		public detalles_t?:string,
		//public assistance_t?:string,
		//public cancel_t?:boolean,
		public status?:string,
		//public servicios_extra?:string,
		//public monto_f?:number,
		public pago?:any,
		public to_pay?:number,
		public balance?:number,

		public deleted?:boolean,
		public _id?:string
	) { }
}