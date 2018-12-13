export class Extra {
	
	constructor (
		public name:string,
		public place:any,
		public price:number,
		public desc?:string,

		public deleted?:boolean,
		public _id?:string
	) { }
}