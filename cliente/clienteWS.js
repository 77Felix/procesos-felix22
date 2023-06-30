function ClienteWS(){
	this.socket;
	this.codigo;

	//ENVIAR PETICIONES AL SERVIDOR
	this.conectar=function(){
		this.socket=io();
		this.servidorWS();
	}

	this.crearPartida=function(){
		this.socket.emit("crearPartida",rest.nick);
	}

	this.unirseAPartida=function(codigo){
		this.socket.emit("unirseAPartida",rest.nick,codigo);
	}

	this.abandonarPartida=function(){
		this.socket.emit("abandonarPartida",rest.nick,cws.codigo);
	}

	this.salir=function(){
		this.socket.emit("salir",rest.nick, cws.codigo);
	}

	this.colocarBarco=function(nombre,x,y){
		this.socket.emit("colocarBarco",rest.nick,nombre,x,y);
	}

	this.barcosDesplegados=function(){
		this.socket.emit("barcosDesplegados",rest.nick);	
	}

	this.disparar=function(x,y){
		this.socket.emit("disparar",rest.nick,x,y);
	}

	//GESTIONES PETICIONES DEL CLIENTE
	this.servidorWS=function(){
		let cli=this;

		this.socket.on("partidaCreada",function(data){
			console.log(data);
			if (data.codigo!=-1){
				console.log("Usuario "+rest.nick+" crea partida codigo: "+data.codigo);
				iu.mostrarAbandonarPartida(data.codigo);
				//iu.mostrarCodigo(data.codigo);
				cli.codigo=data.codigo;
			}
			else{
				console.log("No se ha podido crear partida");
				//iu.mostrarModal("No se ha podido crear partida");
				//iu.mostrarCrearPartida();
				//rest.comprobarUsuario();
			}
		});

		this.socket.on("unirseAPartida",function(data){
			if (data.codigo!=-1){
				console.log("Usuario "+rest.nick+" se une a partida codigo: "+data.codigo);
				iu.mostrarAbandonarPartida(data.codigo);
				//iu.mostrarCodigo(data.codigo);
				cli.codigo=data.codigo;				
			}
			else{
				console.log("No se ha podido unir a partida");
			}
		});

		this.socket.on("partidaNoEncontrada", function(){
			iu.mostrarHome();
			iu.mostrarModal("No se ha encontrado la partida");
		})

		this.socket.on("actualizarListaPartidas",function(lista){
			if (!cli.codigo){
				iu.mostrarListaDePartidasDisponibles(lista);
			}
		});

		this.socket.on("aColocar", function(){
			iu.mostrarModal("Puede colocar los barcos!!!");
		});

		this.socket.on("aJugar",function(res){
			iu.mostrarModal("A jugar!!! Turno de: " +res.turno);			
			//tablero.mostrar(true);
			let data = {"turno": res.turno, "nick": rest.nick};
			iu.mostrarTurno(data);
		});

		this.socket.on("barcoColocado",function(res){
			console.log("Barco "+res.nombre+" colocado?: "+res.colocado);
			let barco=tablero.flota[res.nombre];
			console.log(barco);

			if (res.colocado){
				tablero.terminarDeColocarBarco(barco,res.x,res.y);
				cli.barcosDesplegados();
			}
			else{
				iu.mostrarModal("No se puede colocar barco");
			}
		});

		this.socket.on("faseDesplegando",function(data){
			tablero.flota=data.flota;
			//tablero.mostrar(true);
			tablero.elementosGrid();
			tablero.mostrarFlota();//data.flota);
			//iu.quitarER();  --> Él lo tiene puesto, pero no sé que es
			console.log("Ya puedes desplegar la flota");
		});

		this.socket.on("jugadorAbandona",function(data){
			iu.mostrarModal("Jugador "+data+" ha abandonado la partida.");
			iu.finPartida();
		});

		this.socket.on("disparo",function(res){
			console.log(res.impacto);
			console.log("Turno: "+res.turno);
			if (res.atacante==rest.nick){
				tablero.updateCell(res.x,res.y,res.impacto,'computer-player');
			}
			else{
				tablero.updateCell(res.x,res.y,res.impacto,'human-player');	
			}
		});

		this.socket.on("turnoUsuario", function(res){
			let data = {"turno": res.turno, "nick": rest.nick};
			iu.mostrarTurno(data);
		});

		this.socket.on("turnoIncorrecto", function(){
			console.log("Espere su turno");
			iu.mostrarTurno("Todavía no es su turno");
		});

		this.socket.on("finPartida",function(res){
			console.log("Fin de la partida");
			console.log("Ganador: " +res.turno);
			iu.mostrarModal("Fin de la partida. Ganador: "+res.turno);
			iu.finPartida();
		});

		/*this.socket.on("esperandoRival",function(){
			console.log("Esperando rival");
		});

		this.socket.on("info",function(info){
			console.log(info);
		});*/
	}
}