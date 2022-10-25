function ServidorWS(){
    //Enviar peticiones al Cliente
    this.enviarAlRemitente=function(socket,mensaje,datos){
		socket.emit(mensaje,datos);
	}

    this.enviarATodosEnPartida=function(io,codigo,mensaje,datos){
		io.sockets.in(codigo).emit(mensaje,datos)
	}




    //Gestionar peticiones
    this.lanzarServidorWS = function(io, juego){
        let cli = this;
        io.on('connection', (socket) => {
            console.log('Usuario conectado');
            
            socket.on("crearPartida", function(nick){ 
                //Si se quieren hacer partidas de más de 2 jugadores, hay que agregar la variable 'num' a esta función
                let res = juego.jugadorCreaPartida(nick);
                socket.join(res.codigo);
                cli.enviarAlRemitente(socket, "partidaCreada", res);
            });

            socket.on("unirseAPartida", function(nick, codigo){
                let res = juego.jugadorSeUneAPartida(nick, codigo);
                socket.join(res.codigo);
                cli.enviarAlRemitente(socket, "unidoAPArtida", res);
                
                let partida = juego.obtenerPartida(codigo);
                if(partida.fase.esJugando()){
                    cli.enviarATodosEnPartida(io, codigo, "aJugar", {});
                }
            });
        });
    }
}

module.exports.ServidorWS = ServidorWS;