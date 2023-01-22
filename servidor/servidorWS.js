function ServidorWS(){
    //ENVIAR PETICIONES AL CLIENTE
    this.enviarAlRemitente=function(socket,mensaje,datos){
		socket.emit(mensaje,datos);
	}

    this.enviarATodosEnPartida=function(io,codigo,mensaje,datos){
		io.sockets.in(codigo).emit(mensaje,datos)
	}

    this.enviarATodos=function(socket,mens,datos){
        socket.broadcast.emit(mens,datos);
    }

    this.enviarRestoMiembrosPartida = function(socket,codigo,mens,datos){
        socket.broadcast.to(codigo).emit(mens,datos);
    }


    //GESTIONAR PETICIONES
    this.lanzarServidorWS = function(io, juego){
        let cli = this;
        
        io.on('connection', (socket) => {
            console.log('Usuario conectado');
            
            socket.on("crearPartida", function(nick){ 
                //Si se quieren hacer partidas de más de 2 jugadores, hay que agregar la variable 'num' a esta función
                let res = juego.jugadorCreaPartida(nick);
                let codigoStr = res.codigo.toString();
                socket.join(codigoStr);
                //cli.enviarAlRemitente(socket,"partidaCreada",res);
                cli.enviarAlRemitente(io,codigoStr,"partidaCreada",res)
	  			let lista=juego.obtenerPartidasDisponibles();
	  			cli.enviarATodos(socket,"actualizarListaPartidas",lista);
            });

            socket.on("unirseAPartida", function(nick, codigo){
                let partida=juego.obtenerPartida(codigo);
                if(partida && partida.fase =="inicial"){
                    let res = juego.jugadorSeUneAPartida(nick,codigo);
                    let codigoStr=codigo.toString();
			  	    socket.join(codigoStr);

                    let lista = juego.obtenerPartidasDisponibles();
                    cli.enviarATodos(socket,"actualizarListaPartidas",lista);
                    cli.enviarAlRemitente(socket,"unidoAPartida",res);

                    if (partida.esDesplegando()){
                        let us = juego.obtenerUsuario(nick);
                        let flota = us.obtenerFlota();
                        let res = {};
                        res.flota = flota;
                        cli.enviarATodosEnPartida(io,codigoStr,"faseDesplegando",res);
                    }
                }    
                else {
                    cli.enviarAlRemitente(socket, "partidaNoEncontrada", {});
                }      
            });

            socket.on("abandonarPartida", function(nick, codigo){
                let user = juego.obtenerUsuario(nick);
                if(user){
                    let codigoStr=codigo.toString();
                    juego.jugadorAbandona(nick, codigo);
                    cli.enviarATodosEnPartida(io,codigoStr,"jugadorAbandona",nick);

                    let lista = juego.obtenerPartidasDisponibles();
                    cli.enviarATodos(socket,"actualizarListaPartidas",lista);
                }                
            });

            socket.on("salir", function(nick, codigo){
                if(codigo){
                    let user = juego.obtenerUsuario(nick);
                    if(user){
                        let codigoStr = codigo.toString();
                        console.log("Salir del servidor");
                        juego.jugadorAbandona(nick, codigo);
                        console.log(user.partida.fase);
                        cli.enviarAlRestoPartida(socket,codigoStr,"jugadorAbandona",nick);

                        let lista = juego.obtenerPartidasDisponibles();
                        cli.enviarATodos(socket,"actualizarListaPartidas",lista);
                    }
                }
            })

            /*socket.on("usuarioSale", function(nick){
                socket.disconnect();
            });*/

            socket.on("colocarBarco", function(nick, nombre, x, y){
                let us = juego.obtenerUsuario(nick);
                if (us){
                    let colocado = us.colocarBarco(nombre, x, y);
                    //let estado = us.flota[nombre].desplegado;
                    //let desplegado = us.obtenerBarcoDesplegado(nombre);
                    //let res = {barco: nombre, colocado: desplegado};
                    cli.enviarAlRemitente(socket, "barcoColocado", {nombre, x, y, colocado});
                }
            });

            socket.on("barcosDesplegados", function(nick){
                let us = juego.obtenerUsuario(nick);
                if (us){
                    us.barcosDesplegados();
                    //let partida = us.partida;
                    if (us.partida.esJugando()){ // fase == jugando
                        let res = {"fase": us.partida.fase, "turno": us.partida.turno.nick};
                        let codigoStr = us.partida.codigo.toString();
                        cli.enviarATodosEnPartida(io, codigoStr, "aJugar", res);
                    }
                    /*else {
                        cli.enviarATodosEnPartida(socket, "esperandoRival");
                    }*/
                }
            });

            socket.on("disparar", function(nick, x, y){
                let us = juego.obtenerUsuario(nick);

                //if (us && us.partida.esJugando() && us.partida.turno.nick == nick)
                if(us && us.partida.turno == us && us.partida.esJugando()){
                    let codigoStr = us.partida.codigo.toString();
                    us.disparar(x, y);

                    //Una vez se ha disparado, hay que mirar el tableroRival
                    let estado = us.obtenerEstadoMarcado(x, y);
                    console.log(estado);
                    
                    //let res = {impacto: estado, x:x, y:y, turno: partida.turno.nick};
                    
                    if(us.partida.esFinal()){
                        let res = {"turno": us.partida.turno.nick, "fase": us.partida.fase};
                        cli.enviarATodosEnPartida(io, codigoStr, "finPartida", res);
                    }
                    else {
                        let res = {"turno": us.partida.turno.nick};
                        let data = {"x":x, "y":y, "impacto":estado, "turno":us.partida.turno.nick, "atacante":us.nick};

                        cli.enviarATodosEnPartida(io, codigoStr, "disparo", data);
                        cli.enviarATodosEnPartida(io, codigoStr, "turnoUsuario", res);
                    }
                }
                else {
                    cli.enviarAlRemitente(socket,"turnoIncorrecto",{});
                }
            });
        });
    }
}

module.exports.ServidorWS = ServidorWS;