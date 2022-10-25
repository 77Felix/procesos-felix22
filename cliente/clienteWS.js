function ClienteWS(){

    this.socket;

    //Enviar peticiones al Servidor
    this.conectar = function(){
        this.socket = io();
        this.servidorWS();
    }

    this.crearPartida = function(){
        this.socket.emit("crearPartida", rest.nick);
    }

    this.unirseAPartida = function(codigo){
        this.socker.emit("unirseAPartida", rest.nick, this.codigo);
    }

    //Gestionar peticiones
    this.servidorWS = function(){
        let cli = this;

        this.socket.on("partidaCreada", function(data){
            console.log(data);
			if (data.codigo!=-1){
				console.log("Usuario "+rest.nick+" crea partida codigo: "+data.codigo)
				iu.mostrarCodigo(data.codigo);
			}
			else{
				console.log("No se ha podido crear partida");
			}
        });

        this.socket.on("unidoAPArtida", function(data){
            console.log(data);
            if (data.codigo!=-1){
				console.log("Usuario "+rest.nick+" se une a partida codigo: "+data.codigo);
				iu.mostrarCodigo(data.codigo);
			}
			else{
				console.log("No se ha podido unir a partida");
			}
        });
    }
}