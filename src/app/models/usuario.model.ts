export class Usuario {
	
	constructor (
		public nombre:string,
		public email:string,
		public password:string,
		public img?:string,
		public role:string = 'MANAGER_ROLE',

		public deleted?:string,
		public user_parent?:string,
		public _id?:string
	) { }
}