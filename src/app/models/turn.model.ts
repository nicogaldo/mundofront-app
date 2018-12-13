export class Turn {
	
	constructor (
		public place:string,
		public name:string,
		public from:string,
		public to:string,

		public deleted?:boolean,
		public _id?:string
	) { }
}