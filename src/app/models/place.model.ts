export class Place {
	
	constructor (
		public name:string,
		public desc?:string,
		public color1?:any,
		public turns?:string,

		public deleted?:boolean,
		public _id?:string
	) { }
}