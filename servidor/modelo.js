let cad = require("./cad.js");

function Juego(test){
	this.partidas={};
	this.usuarios={}; //array asociativo
	this.cad = new cad.Cad();
	this.test = test;

	this.agregarUsuario=function(nick){
		let res={"nick":-1};
		if (!this.usuarios[nick]){
			this.usuarios[nick]=new Usuario(nick,this);
			this.insertarLog({"operacion":"inicioSesion", "usuario":nick, "fecha":Date()},function(){
				console.log("Registro de log(iniciar sesion) insertado");
			});
			res={"nick":nick};
			console.log("Nuevo usuario: "+nick);
		}
		return res;
	}

	this.eliminarUsuario=function(nick){
		delete this.usuarios[nick];
	}

	this.usuarioSale=function(nick){
		if (this.usuarios[nick]){
			this.finalizarPartida(nick);
			this.eliminarUsuario(nick);
			this.insertarLog({"operacion": "finSesion", "usuario": nick, "fecha": Date()}, function(){
				console.log("Registro de log(salir) insertado");
			});
		}
	}

	this.jugadorCreaPartida=function(nick){
		let usr = this.usuarios[nick];
		let res={codigo:-1};
  		if (usr){
    		let codigo=usr.crearPartida();
	    	//let codigo=this.crearPartida(usr);
	    	res={codigo:codigo};
	    }
    	return res;
	}

	this.jugadorSeUneAPartida=function(nick,codigo){
		let usr = this.usuarios[nick];
		let res={"codigo":-1};
  		if (usr){
    		let valor=usr.unirseAPartida(codigo);
    		//let valor=this.unirseAPartida(codigo,usr)
	    	res={"codigo":valor};
	    }
    	return res;
	}

	this.obtenerUsuario=function(nick){
		//if (this.usuarios[nick]){
		return this.usuarios[nick];
		//}
	}

	this.crearPartida=function(usr){
		let codigo=Date.now();
		console.log("Usuario " +usr.nick+ " crea partida " +codigo);
		this.insertarLog({"operacion":"crearPartida", "propietario":usr.nick, "codigo":codigo, "fecha":Date()},function(){
			console.log("Registro de log(crear partida) insertado");
		});
		this.partidas[codigo]=new Partida(codigo,usr); 
		return codigo;
	}

	this.unirseAPartida=function(codigo,usr){
		let res=-1;
		if (this.partidas[codigo]){
			res = this.partidas[codigo].agregarJugador(usr);

			this.insertarLog({"operacion":"unirsePartida", "usuario":usr.nick, "codigoPartida":codigo, "fecha":Date()},function(){
				console.log("Registro de log(unirse a partida) insertado");
			});
		}
		else{
			console.log("La partida no existe");
		}
		return res;
	}

	this.obtenerPartidas=function(){
		let lista=[];
		for (let key in this.partidas){
			lista.push({"codigo":key, "owner":this.partidas[key].owner.nick});
		}
		return lista;
	}

	this.obtenerPartidasDisponibles=function(){
		let lista=[];
		for (let key in this.partidas){
			if (this.partidas[key].fase=="inicial"){
				lista.push({"codigo": key, "owner": this.partidas[key].owner.nick, "fase":this.partidas[key].fase});
			}
		}
		return lista;
	}

	this.finalizarPartida=function(nick){
		for (let key in this.partidas){
			if ((this.partidas[key].fase == "inicial" || this.partidas[key].fase == "desplegando") && this.partidas[key].estoy(nick)) {
			//if (this.partidas[key].fase=="inicial" && this.partidas[key].estoy(nick)){
				this.partidas[key].fase="final";

				this.insertarLog({"operacion": "FinalizarPartida", "partida": this.partidas[key].codigo, "fecha": Date()}, function(){
					console.log("Registro de log(finalizarPartida) insertado");
				});
			
				return this.partidas[key].codigo;
			}
		}
	}

	this.obtenerPartida=function(codigo){
		return this.partidas[codigo];
	}

	this.jugadorAbandona = function(nick, codigo){
		if(this.partidas[codigo]){
			this.partidas[codigo].fase = "final";		
			this.insertarLog({"operacion": "jugadorAbandonaPartida", "propietario": usr.nick, "partida": this.partida, "fecha": Date()}, function(){
				console.log("Registro de log(abandonarPartida) insertado");
			});
		}
	}

	this.insertarLog = function(log, callback){
		if(this.test == 'false'){
			this.cad.insertarLog(log, callback);
		}
	}

	this.obtenerLogs = function(callback){
		this.cad.obtenerLogs(callback);
	}

	if(test == 'false'){
		this.cad.connect(function(db){
			console.log("conectado a Atlas");
		});
	}
}

function Usuario(nick,juego){
	this.nick=nick;
	this.juego=juego;
	this.tableroPropio;
	this.tableroRival;
	this.partida;
	this.flota={}; //podría ser array []

	this.crearPartida=function(){
		return this.juego.crearPartida(this)
	}

	this.unirseAPartida=function(codigo){
		return this.juego.unirseAPartida(codigo,this);
	}

	this.inicializarTableros=function(dim){
		this.tableroPropio=new Tablero(dim);
		this.tableroRival=new Tablero(dim);
	}

	this.inicializarFlota=function(){
		//this.flota["b1-1"] = new Barco("b1-1", 1);
		//this.flota["b2-1"] = new Barco("b2-1", 1);
		// this.flota.push(new Barco("b2",2));
		// this.flota.push(new Barco("b4",4));
		this.flota["b2"]=new Barco("b2",2, new Horizontal());
		this.flota["b4"]=new Barco("b4",4, new Horizontal());
		// otros barcos: 1, 3, 5,...
		//this.flota["b5"]=new Barco("b5",5);
	}

	this.obtenerFlota = function(){
		return this.flota;
	}

	this.colocarBarco=function(nombre,x,y){
		//comprobar fase
		//if (this.partida && this.partida.fase=="desplegando" && barco.desplegado){ ALGO FALTA AL FINAL
		if(this.partida && this.partida.fase=="desplegando"){
			let barco=this.flota[nombre];
			if(!barco.desplegado){
				return this.tableroPropio.colocarBarco(barco,x,y);
			}
		}

		return false;
	}

	this.comprobarLimites = function(tam, x) {
		return this.tableroPropio.comprobarLimites(tam, x)
	}

	this.todosDesplegados=function(){
		for(var key in this.flota){
			if (!this.flota[key].desplegado){
				return false;
			}
		}
		return true;
	}

	this.barcosDesplegados=function(){
		if(this.partida && this.partida.esDesplegando()){
			this.partida.barcosDesplegados();
		}
	}

	this.disparar=function(x,y){
		if(x<=this.tableroPropio.size && y<=this.tableroPropio.size && x>=0 && y>=0){
			this.partida.disparar(this.nick,x,y);
		}
	}

	this.meDisparan=function(x,y){
		return this.tableroPropio.meDisparan(x,y);
	}

	this.obtenerEstado=function(x,y){
		return this.tableroPropio.obtenerEstado(x,y);
	}

	this.obtenerEstadoMarcado = function(x, y){
		return this.tableroRival.obtenerEstado(x,y);
	}

	this.marcarEstado=function(estado,x,y){
		this.tableroRival.marcarEstado(estado,x,y);
		if (estado=="agua"){
			this.partida.cambiarTurno(this.nick);
		}
	}

	this.flotaHundida=function(){
		for(var key in this.flota){
			if (this.flota[key].estado!="hundido"){
				return false;
			}
		}
		return true;
	}

	this.obtenerFlota = function() {
		return this.flota;
	}

	this.obtenerBarcoDesplegado = function(nombre, x){
        for (let key in this.flota) {
            if (this.flota[key].nombre == nombre) {
                if (this.comprobarLimites(this.flota[key].tam, x)) {
                    //return this.flota[key];
					return true;
                } else {
                    return false;
                }
            }
        }
        return undefined;
    }

	this.insertarLog=function(logs, callback){
		this.juego.insertarLog(logs, callback);
	}

	this.flotasDesplegadas = function(){
		return this.partida.flotasDesplegadas();
	}

	/*this.logAbandonarPartida = function(jugador,codigo){
		this.juego.insertarLog({"operacion":"abandonarPartida", "usuario":jugador.nick, "codigo":codigo, "fecha":Date()}, function(){
			console.log("Registro de log(abandonar) insertado");
		})
	};*/

	this.logFinalizarPartida = function(perdedor,ganador,codigo){
		this.juego.insertarLog({"operacion":"finalizarPartida", "perdedor":perdedor, "ganador":ganador, "codigo":codigo, "fecha":Date()}, function(){
			console.log("Registro de log(finalizarPartida) insertado");
		})
	};
}

function Partida(codigo,usr){
	this.codigo=codigo;
	this.owner=usr;
	this.jugadores=[];
	this.fase="inicial"; //new Inicial()
	this.maxJugadores=2;

	this.agregarJugador=function(usr){ //this.puedeAgregarJugador
		let res=this.codigo;
		if (this.hayHueco()){ 
			this.jugadores.push(usr);
			console.log("El usuario "+usr.nick+" se une a la partida "+ this.codigo);
			usr.partida=this;
			usr.inicializarTableros(10);
			usr.inicializarFlota();
			this.comprobarFase();
			usr.insertarLog({"operacion":"unirseAPartida","codigoPartida":this.codigo,"jugador2":usr.nick,"fecha":Date()},function(){
				console.log("Registro de log(jugador2 - unirseAPartida) insertado");
			});
		}
		else{
			res=-1;
			console.log("La partida está completa")
		}
		return res;
	}

	this.comprobarFase=function(){
		if (!this.hayHueco()){
			this.fase="desplegando";
		}
	}

	this.hayHueco=function(){
		return (this.jugadores.length<this.maxJugadores)
	}

	this.estoy=function(nick){
		for(i=0; i<this.jugadores.length; i++){
			if (this.jugadores[i].nick==nick){
				return true;
			}
		}
		return false;
	}

	this.esJugando=function(){
		return this.fase== "jugando";
	}

	this.esDesplegando=function(){
		return this.fase== "desplegando";
	}
	this.esAbandonada = function(){
		return this.fase == "abandonada";
	}

	this.esFinal=function(){
		return this.fase== "final";
	}

	this.eliminarUsuario = function(){
		delete this.usuarios[nick];
	}

	this.flotasDesplegadas=function(){
		for(i=0; i<this.jugadores.length; i++){
			if (!this.jugadores[i].todosDesplegados()){
				return false;
			}
		}
		return true;
	}

	this.barcosDesplegados=function(){
		if (this.flotasDesplegadas()){
			this.fase="jugando";
			this.asignarTurnoInicial();
		}
	}

	this.asignarTurnoInicial=function(){
		this.turno=this.jugadores[0];
	}

	this.cambiarTurno=function(nick){
		this.turno=this.obtenerRival(nick);
	}

	this.obtenerTurno = function () {
		return this.turno;
	}

	this.obtenerRival=function(nick){
		let rival;
		for(i=0; i<this.jugadores.length; i++){
			if (this.jugadores[i].nick!=nick){
				rival = this.jugadores[i];
			}
		}
		return rival;
	}

	this.obtenerJugador=function(nick){
		let jugador;
		for(i=0; i<this.jugadores.length; i++){
			if (this.jugadores[i].nick==nick){
				jugador=this.jugadores[i];
			}
		}
		return jugador;
	}

	this.disparar = function(nick,x,y){
		let atacante=this.obtenerJugador(nick);
		if (this.turno.nick == atacante.nick){
			let atacado = this.obtenerRival(nick);
			let estado = atacado.meDisparan(x, y);
			//let estado = atacado.obtenerEstado(x,y);

			//console.log(estado);
			
			atacante.marcarEstado(estado,x,y);
			this.comprobarFin(atacado);
			//console.log(atacante.nick + ' dispara a ' + atacado.nick + ' en casillas ' + x, y);
			//return estado;
		}	
		else{
			console.log("No es tu turno")
		}
	}

	this.comprobarFin=function(jugador){
		if (jugador.flotaHundida()){
			this.fase="final";
			console.log("Fin de la partida");
			console.log("Gandor: "+this.turno.nick);
			jugador.logFinalizarPartida(jugador.nick, this.turno.nick, this.codigo);
		}
	}

	this.abandonarPartida = function (jugador) {
		if (jugador) {
			rival = this.obtenerRival(jugador.nick)
			this.fase = "final";
			console.log("Fin de la partida");
			console.log("Ha abandonado el jugador " + jugador.nick);
			if (rival) {
				console.log("Ganador: " + rival.nick);
			}
			// this.jugador.juego.cad.insertarLog({"operacion":"crearPartida","propietario":usr.nick,"fecha":Date()},function(){
			// 	console.log("Registro de log(abandonar) insertado");
			// });
			jugador.logAbandonarPartida(jugador,this.codigo);
		}
	}

	this.agregarJugador(this.owner);
}

function Tablero(size){
	this.size=size; //filas=columnas=size
	this.casillas;

	this.crearTablero=function(tam){
		this.casillas=new Array(tam);
		for(x=0; x<tam; x++){
			this.casillas[x]=new Array(tam);
			for(y=0; y<tam; y++){
				this.casillas[x][y]=new Casilla(x,y);
			}
		}
	}

	this.colocarBarco=function(barco,x,y){
		// if (this.comprobarLimites(barco.tam, x)) {
		// 	if (this.casillasLibres(x, y, barco.tam)) {
		// 		for (i = x; i < barco.tam + x; i++) {
		// 			this.casillas[i][y].contiene = barco;
		// 			//console.log('Revisando casillas', i, y, ':', this.casillas[i][y].contiene);
		// 			console.log('Barco', barco.nombre, 'colocado en', i, y)
		// 		}
		// 		barco.desplegado = true;
		// 	}
		// }
		//console.log(barco,this,x,y)
		return barco.colocar(this, x, y);
	}

	this.comprobarLimites = function(tam, x) {
		if (x + tam > this.size) {
			console.log('Excede los limites');
			return false;
		} else { 
			return true;
		}
	}

	this.casillasLibresH = function (x, y, tam) {
		for (i = x; i < tam; i++) {
			let contiene = this.casillas[i][y].contiene;
			if (!contiene.esAgua()) {
				return false;
			}
		}
		return true;
	}

	this.casillasLibresV = function (x, y, tam) {
		for (i = y; i < tam; i++) {
			let contiene = this.casillas[x][i].contiene;
			if (!contiene.esAgua()) {
				return false;
			}
		}
		return true;
	}

	/*this.casillasLibres=function(x,y,tam){
		if(x+tam > this.size){
			return false;
		}
		for(i=0;i<tam;i++){
			let contiene=this.casillas[i+x][y].contiene;
			if (!contiene.esAgua()){
				return false;
			}
		}
		return true;
	}*/

	this.meDisparan=function(x,y){
		return this.casillas[x][y].contiene.meDisparan(this, x, y);
	}

	this.obtenerEstado=function(x,y){
		return this.casillas[x][y].contiene.obtenerEstado();
	}

	this.marcarEstado=function(estado,x,y){
		this.casillas[x][y].contiene = estado;
	}

	this.ponerAgua = function(x, y){
		return this.casillas[x][y].contiene = new Agua();
	}

	this.esTablero = function(){
		return true;
	}
	
	this.crearTablero(size);
}

function Casilla(x,y){
	this.x=x;
	this.y=y;

	this.contiene=new Agua();
}

function Barco(nombre,tam, ori){ //"b2" barco tamaño 2
	this.nombre = nombre;
	this.tam = tam;
	this.orientacion = ori; //horizontal, vertical...
	this.desplegado = false;
	this.estado = "intacto";
	this.disparos=0; //deprecated
	this.x; //this.punto = {}; this.punto.x = x; this.punto.y = y;
	this.y;
	this.casillas = {}; //en vez de []

	this.esAgua=function(){
		return false;
	}

	this.posicion = function(x, y){
		this.x = x;
		this.y = y;
		this.desplegado = true;
		this.iniCasillas();
	}

	this.colocar = function(tablero, x, y){
		return this.orientacion.colocarBarco(this, tablero, x, y);
	}

	this.meDisparan=function(tablero, x, y){
		//this.disparos++;
        //if (this.casillas[this.x + x] == 'intacto') { this.punto.x + x
		//Cambiado, puede no ser necesario este if
		this.estado = "tocado";
		//this.casillas[this.x + x] = 'tocado'
		this.casillas[x] = 'tocado'
		console.log("Tocado")
		//}
		if (this.comprobarCasillas()) {
			this.estado = "hundido";
			console.log("Hundido")
		}
		//tablero.ponerAgua(x, y);
		return this.estado;
	}

	this.obtenerEstado = function () {
		return this.estado;
	}

	this.comprobarCasillas = function(){
		for(i=0; i<this.tam; i++){
			if(this.casillas[this.x + i] == "intacto"){
				return false;
			}
		}
		return true;
	}

	this.iniCasillas = function(){ //Ha cambiado todo esto al ser un array asociativo
		for(i=0; i<tam; i++){
			this.casillas[i + this.x] = "intacto";
		}
	}

	//this.iniCasillas(tam);
}

function Horizontal(){
	this.nombre = "Horizontal";

	this.colocarBarco = function(barco, tablero, x, y){
		if(tablero.comprobarLimites(barco.tam, x)){
			if(tablero.casillasLibresH(x, y, barco.tam)){
				//console.log(x,y,barco.tam);

				for (let i = x; i < barco.tam + x; i++) {	
					tablero.casillas[i][y].contiene = barco;
					console.log('Barco', barco.nombre, 'colocado en', i, y)
				}
				barco.posicion(x, y);
				console.log(barco);
				return true;
			}
		}

		return false;
	}

	this.esHorizontal = function(){
		return true;
	}

	this.esVertical = function(){
		return false;
	}
}

function Vertical(){
	this.nombre="vertical";

	this.colocarBarco = function (barco, tablero, x, y){
        if (tablero.comprobarLimites(barco.tam, y)) {
            if (tablero.casillasLibresV(x, y, barco.tam)) {
				//console.log(x,y,barco.tam)
                    for (let i = y; i < barco.tam + y; i++) {	
                        tablero.casillas[x][i].contiene = barco;
                        console.log('Barco', barco.nombre, 'colocado en', x, i)
                    }
                barco.posicion(x, y);
            }
        }
    }

	this.esVertical = function(){
		return true;
	}

	this.esHorizontal = function(){
		return false;
	}
}

function Agua(){
	this.nombre ="agua";
	this.estado = "agua";

	this.esAgua=function(){
		return true;
	}

	this.meDisparan=function(){
		console.log("Agua");
		return this.obtenerEstado();
	}

	this.obtenerEstado=function(){
		return this.estado;
	}
}

function Inicial(){
	this.nombre = "inicial";
}

function Jugando(){
	this.nombre = "jugando";
}

function Desplegando(){
	this.nombre = "desplegando";
}

module.exports.Juego = Juego;