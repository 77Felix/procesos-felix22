function Juego(){
	this.partidas={};
	this.usuarios={}; //array asociativo

	this.agregarUsuario=function(nick){
		let res = {"nick":-1};
		if (!this.usuarios[nick]){
			this.usuarios[nick]=new Usuario(nick,this);
			res = {"nick": nick};
			console.log("Nuevo usuario: " +nick);
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
		}
	}

	this.jugadorCreaPartida = function(nick){
		let usr = this.usuarios[nick];
		let res = {"codigo": -1};
		
		if(usr){
			let codigo = usr.crearPartida();
			//let codigo = this.crearPartida(usr);
			res = {"codigo": codigo};
		}

		return res;
	}

	this.crearPartida=function(usr){
		let codigo=Date.now();
		console.log("Usuario "+usr.nick+ " crea partida "+codigo);	
		this.partidas[codigo]=new Partida(codigo,usr); 
		return codigo;
	}

	this.jugadorSeUneAPartida = function(nick, codigo){
		let usr = this.usuarios[nick];
		let res = {"codigo": -1};

		if(usr){
			let valor = usr.unirseAPartida(codigo);
			//let valor = this.unirseAPartida(codigo, usr);
			res = {"codigo": valor};
		}

		return res;
	}

	this.unirseAPartida=function(codigo,usr){
		let res= -1;
		if (this.partidas[codigo]){
			res = this.partidas[codigo].agregarJugador(usr);
		}
		else{
			console.log("La partida no existe");
		}

		return res;
	}

	this.obtenerPartidas=function(){
		let lista=[];
		for (let key in this.partidas){
			lista.push({"codigo":key,"owner":this.partidas[key].owner.nick});
		}
		return lista;
	}

	this.obtenerPartida=function(codigo){
		if (this.partidas[codigo]){
			return this.partidas[codigo];
		}
	}

	this.obtenerPartidasDisponibles=function(){
		//devolver solo las partidas sin completar
		let lista=[];
		for (let key in this.partidas){
			if (this.partidas[key].fase=="inicial"){
				lista.push({"codigo":key,"owner":this.partidas[key].owner.nick});
			}
		}
		return lista;
	}

	this.finalizarPartida = function(nick){
		for(let key in this.partidas){
			if(this.partidas[key].fase=="inicial" && this.partidas[key].estoy(nick)){
				this.partidas[key].fase="final";
			}
		}
	}
}

function Usuario(nick,juego){
	this.nick=nick;
	this.juego=juego;
	this.tableroPropio;
	this.tableroRival;
	this.flota = {}; //podría ser []

	this.crearPartida=function(){
		return this.juego.crearPartida(this)
	}

	this.unirseAPartida=function(codigo){
		this.juego.unirseAPartida(codigo,this);
	}

	this.inicializarTableros = function(dim){
		this.tableroPropio = new Tablero(dim);
		this.tableroRival = new Tablero(dim);
	}

	this.inicializarFlota = function(){
		/*this.inicializarFlota.push(new Barco("b2", 2));
		this.flota.push(new Barco("b4", 4));*/

		this.flota["b2"] = new Barco("b2", 2);
		this.flota["b4"] = new Barco("b4", 4);
		//otros barcos: 1, 3, 5
	}

	this.colocarBarco = function(nombre, x, y){
		//Comprobar fase
		if(partidas.fase=="desplegando"){
			let barco = this.flota[nombre];
			this.tableroPropio.colocarBarco(barco, x, y);
		}
		//Coloca el barco de nombre en la casilla x,y del tablero proporcionado
	}

	this.todosDesplegados = function(){
		for(var key in this.flota){
			if(!this.flota[key].desplegado){
				return false;
			}
		}

		return true;
	}

	this.barcosDesplegados = function(){
		this.partida.barcosDesplegados();
	}

	this.disparar = function(x, y){
		this.partida.disparar(this.nick, x, y);
	}

	this.meDisparan = function(x, y){
		this.tableroPropio.meDisparan(x, y);
	}

	this.obtenerEstado = function(x, y){
		return this.tableroPropio.obtenerEstado(x, y);
	}

	this.marcarEstado = function(estado, x, y){
		this.tableroRival.marcarEstado(estado, x, y);
		if(estado=="Agua"){
			this.partida.cambiarTurno(this.nick);
		}
	}

	this.flotaHundida = function(){
		for(var key in this.flota){
			if(!this.flota[key].estado == "Hundido"){
				return false;
			}
		}

		return true;
	}
}

function Partida(codigo,usr){
	this.codigo=codigo;
	this.owner=usr;
	this.jugadores=[];
	this.fase="inicial"; //new Inicial()
	this.maxJugadores = 2;

	this.agregarJugador=function(usr){
		let res = this.codigo;
		if (this.hayHueco()){
			this.jugadores.push(usr);
			console.log("El usuario " + usr.nick + " se une a la partida " +this.codigo);
			usr.inicializarTableros(5);
			usr.inicializarFlota();
			this.comprobarFase();
		}
		else{
			res = -1;
			console.log("La partida está completa")
		}

		return res;
	}

	this.comprobarFase = function(){
		if(!this.hayHueco()){
			this.fase = "desplegando";
		}
	}

	this.hayHueco = function(){
		return (this.jugadores.length<this.maxJugadores);
	}

	this.estoy = function(nick){
		for(i=0; i<this.jugadores.length; i++){
			if(this.jugadores[i].nick==nick){
				return true;
			}
		}
		return false;
	}

	this.esJugando = function(){
		return this.fase=="jugando";
	}

	this.flotasDesplegadas = function(){
		for(i=0; this.jugadores.length; i++){
			if(!this.jugadores[i].todosDesplegados()){
				return false;
			}
		}

		return true;
	}

	this.barcosDesplegados = function(){
		if(this.flotasDesplegadas()){
			this.fase = "jugando";
			this.asignarTurnoInicial();
		}
	}

	this.asignarTurnoInicial = function(){
		this.turno = this.jugadores[0];
	}

	this.cambiarTurno = function(nick){
		this.turno = this.obtenerRival(nick);
	}

	this.obtenerRival = function(nick){
		let rival;
		for(i=0; i<this.jugadores.length; i++){
			if(this.jugadores[i].nick != nick){
				rival = this.jugadores[i];
			}
		}

		return rival;
	}

	this.obtenerJugador = function(nick){
		let jugador;
		for(i=0; i<this.jugadores.length; i++){
			if(this.jugadores[i].nick == nick){
				jugador = this.jugadores[i];
			}
		}

		return jugador;
	}

	this.disparar = function(nick, x, y){
		let atacante = this.obtenerJugador();
		if(this.turno.nick == atacante.nick){
			let atacado = this.obtenerRival(nick);

			atacado.meDisparan(x, y);
			let estado = atacado.obtenerEstado(x, y);
			atacante.marcarEstado(estado, x, y);
			this.comprobarFin(atacado);
		} 
		else {
			console.log("No es tu turno");
		}
	}

	this.comprobarFin = function(jugador){
		if(jugador.flotaHundida()){
			this.fase = "Final";
			console.log("Fin de la partida");
			console.log("Ganador: " +turno.nick);
		}
	}

	this.agregarJugador(this.owner);
}

function Tablero(size){
	this.size = size; //filas = columnas = size
	this.casillas;

	this.crearTablero=function(tam){
		this.casillas=new Array(tam);
		for(x=0;x<tam;x++){
			this.casillas[x]=new Array(tam);
			for(y=0;y<tam;y++){
				this.casillas[x][y]=new Casilla(x,y);
			}
		}
	}

	this.colocarBarco = function(barco, x, y){
		if(this.casillasLibres(x,y, barco.tam)){
			for(i=x; i<barco.tam; i++){
				this.casillas[i][y].contiene = barco;
			}
			barco.desplegado = true;
		}
	}

	this.casillasLibres = function(x, y, tam){
		for(i=x; i<barco.tam; i++){
			let casilla = this.casillas[i][y].contiene;
			if(!contiene.esAgua()){
				return false;
			}
		}

		return true;
	}

	this.meDisparan = function(x, y){
		this.casillas[x][y].contiene.meDisparan();
	}

	this.obtenerEstado = function(x, y){
		return this.casillas[x][y].contiene.obtenerEstado();
	}

	this.marcarEstado = function(estado, x, y){
		this.casillas[x][y].contiene = estado;
	}

	this.crearTablero(size);

}

function Casilla(x, y){
	this.x = x;
	this.y = y;

	this.contiene = new Agua();
}

function Barco(nombre, tam){
	this.nombre = nombre;
	this.tam = tam;
	this.desplegado = false;
	this.estado = "intacto";
	this.disparos = 0;
	this.orientacion; //horizontal, vertical
	//Se asume que todas las orientaciones son horizontales

	this.esAgua = function(){
		return false;
	}

	this.meDisparan = function(){
		this.disparos++;
		if(this.disparos<this.tam){
			this.estado = "tocado";
			console.log("Tocado");
		}
		else {
			this.estado = "hundido";
			console.log("Hundido");
		}
	}

	this.obtenerEstado = function(){
		return this.estado;
	}
}

function Agua(){
	this.nombre = "Agua";
	
	this.esAgua = function(){
		return true;
	}

	this.meDisparan = function(){
		console.log("Agua");
	}

	this.obtenerEstado = function(){
		return "Agua";
	}
}

module.exports.Juego = Juego;