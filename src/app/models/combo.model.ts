export class Combo {
	
	constructor (
		public name:string,
		public place:string,
		public price:number,
		public desc?:string,

		public deleted?:boolean,
		public _id?:string
	) { }
}