// function singleton() {}
// function inject(){}

export interface Model{
	action(name:String);
}

export class Controller {
	@@inject
	private model : Model;
	do(){
		this.model.action('now!');
	}
}

@@singleton
export class ModelImpl implements Model {
	foo:string = 'bar';
	action(namer:String){
		console.log('running ModelImpl action');
	}
}

