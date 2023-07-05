let modelo = require("./modelo.js");

describe("El juego...", function () {
  var miJuego;
  var us1, us2, partida;

  beforeEach(function () {
    miJuego = new modelo.Juego(true);
    miJuego.agregarUsuario("pepe");
    miJuego.agregarUsuario("luis");

    let res = miJuego.jugadorCreaPartida("pepe");
    miJuego.jugadorSeUneAPartida("luis", res.codigo);
    us1 = miJuego.obtenerUsuario("pepe");
    us2 = miJuego.obtenerUsuario("luis");
    partida = miJuego.obtenerPartida(res.codigo);
  });

  it("comprobamos los nick de los usuarios", function () {
    expect(us1.nick).toEqual("pepe");
    expect(us2.nick).toEqual("luis");

    //comprobar que los usuarios están en la partida
    //comprobar que cada usuario tiene 2 tableros de 5x5
    //que contienen agua (esAgua())
    //comprobar que cada usuario tiene 1 flota de 2 barcos
    //de tamaño 4 y 2
    //comprobar que la partida esta en fase jugando
  });

  it("comprobamos que pepe crea la partida, y luis se une a ella", function () {
    let codigo=us1.crearPartida();
    let partida=miJuego.partidas[codigo];
    us2.unirseAPartida(codigo);
    expect(partida.jugadores.length).toEqual(2);
    expect(partida.jugadores[1].nick).toEqual(us2.nick);
  });

  it("comprobamos los usuarios que hay en la partida", function(){
    expect(partida.estoy(us1.nick));
    expect(partida.estoy(us2.nick));
  });

  it("los dos jugadores tienen tablero propio y rival", function () {
    expect(us1.tableroPropio).toBeDefined();
    expect(us2.tableroPropio).toBeDefined();
    expect(us1.tableroRival).toBeDefined();
    expect(us2.tableroRival).toBeDefined();

    expect(us1.tableroPropio.casillas.length).toEqual(10);
    expect(us2.tableroPropio.casillas.length).toEqual(10);

    expect(us1.tableroPropio.casillas[0].length).toEqual(10);
    expect(us2.tableroPropio.casillas[0].length).toEqual(10);

    //habría que recorrer las 10 columnas
    for (x = 0; x < 10; x++) {
      for(y = 0; y < 10; y++){
        expect(us1.tableroPropio.casillas[x][y].contiene.esAgua()).toEqual(true);
      }
    }
  });

  it("los dos jugadores tienen flota (2 barcos, tam 2 y 4)", function () {
    expect(us1.flota).toBeDefined();
    expect(us2.flota).toBeDefined();

    expect(Object.keys(us1.flota).length).toEqual(5);
    expect(Object.keys(us2.flota).length).toEqual(5);

    //expect(Object.keys(["b1-1"]).tam).toEqual(1);
    //expect(Object.keys(["b2-1"]).tam).toEqual(1);
    expect(us1.flota["b2"].tam).toEqual(2);
    expect(us1.flota["b4"].tam).toEqual(4);
    expect(us1.flota["b1"].tam).toEqual(1);
    expect(us1.flota["b3"].tam).toEqual(3);
    expect(us1.flota["b5"].tam).toEqual(5);
    //expect(Object.keys(["b5"]).tam).toEqual(5);

    expect(us2.flota["b2"].tam).toEqual(2);
    expect(us2.flota["b4"].tam).toEqual(4);
    expect(us2.flota["b1"].tam).toEqual(1);
    expect(us2.flota["b3"].tam).toEqual(3);
    expect(us2.flota["b5"].tam).toEqual(5);
  });

  it("la partida está en fase desplegando", function () {
    expect(partida.esJugando()).toEqual(false);
    expect(partida.esDesplegando()).toEqual(true);
  })

  describe("A jugar!", function () {
    beforeEach(function () {
      us1.colocarBarco("b2", 0, 0); // 0,0 1,0
      us1.colocarBarco("b4", 0, 1); // 0,1 1,1 2,1 3,1
      us1.colocarBarco("b1", 0, 2); // 0,2
      us1.colocarBarco("b3", 0, 3); // 0,3 1,3 2,3 
      us1.colocarBarco("b5", 0, 4); // 0,4 1,4 2,4 3,4 4,4
      us1.barcosDesplegados();

      //us1.colocarBarco("b1-1", 0 , 2);
      //us1.colocarBarco("b2-1", 0 , 3);
      //us1.colocarBarco("b5", 0 , 4);
      
      us2.colocarBarco("b2", 0, 0); // 0,0 1,0
      us2.colocarBarco("b4", 0, 1); // 0,1 1,1 2,1 3,1
      us2.colocarBarco("b1", 0, 2); // 0,2
      us2.colocarBarco("b3", 0, 3); // 0,3 1,3 2,3 
      us2.colocarBarco("b5", 0, 4); // 0,4 1,4 2,4 3,4 4,4
      us2.barcosDesplegados();
      //us2.colocarBarco("b1-1", 0 , 2);
      //us2.colocarBarco("b2-1", 0 , 3);
      //us2.colocarBarco("b5", 0 , 4);
    });

    it("Comprobar que las flotas están desplegadas", function () {
      expect(us1.obtenerBarcoDesplegado("b2", 0)).toEqual(true);
      expect(us2.obtenerBarcoDesplegado("b2", 0)).toEqual(true);
      expect(us1.flotasDesplegadas()).toEqual(true);
      expect(us2.flotasDesplegadas()).toEqual(true);
      expect(partida.flotasDesplegadas()).toEqual(true);
      expect(partida.esJugando()).toEqual(true);
    });

    it("comprobar que el turno es de Pepe", function(){
      expect(partida.turno.nick).toEqual("pepe");
    })

    it("Comprobar jugada que Pepe gana", function () {
      // Barco "b2"
      expect(us2.obtenerEstado(0, 0)).toEqual("intacto");
      //expect(us2.flota["b2"].estado).toEqual("intacto");
      us1.disparar(0, 0);
      expect(us2.obtenerEstado(0, 0)).toEqual("tocado");
      //expect(us2.flota["b2"].estado).toEqual("tocado");
      us1.disparar(1, 0);
      expect(us2.obtenerEstado(1, 0)).toEqual("hundido");
      //expect(us2.flota["b2"].estado).toEqual("hundido");

      // Barco "b4"
      expect(us2.flota["b4"].estado).toEqual("intacto");
      us1.disparar(0, 1);
      expect(us2.flota["b4"].estado).toEqual("tocado");
      us1.disparar(1, 1);
      expect(us2.flota["b4"].estado).toEqual("tocado");
      us1.disparar(2, 1);
      expect(us2.flota["b4"].estado).toEqual("tocado");
      us1.disparar(3, 1);
      expect(us2.flota["b4"].estado).toEqual("hundido");

      // Barco "b1"
      expect(us2.flota["b1"].estado).toEqual("intacto");
      us1.disparar(0, 2);
      expect(us2.flota["b1"].estado).toEqual("hundido");

      // Barco "b3"
      expect(us2.flota["b3"].estado).toEqual("intacto");
      us1.disparar(0, 3);
      expect(us2.flota["b3"].estado).toEqual("tocado");
      us1.disparar(1, 3);
      expect(us2.flota["b3"].estado).toEqual("tocado");
      us1.disparar(2, 3);
      expect(us2.flota["b3"].estado).toEqual("hundido");

      // Barco "b5"
      expect(us2.flota["b5"].estado).toEqual("intacto");
      us1.disparar(0, 4);
      expect(us2.flota["b5"].estado).toEqual("tocado");
      us1.disparar(1, 4);
      expect(us2.flota["b5"].estado).toEqual("tocado");
      us1.disparar(2, 4);
      expect(us2.flota["b5"].estado).toEqual("tocado");
      us1.disparar(3, 4);
      expect(us2.flota["b5"].estado).toEqual("tocado");
      us1.disparar(4, 4);
      expect(us2.flota["b5"].estado).toEqual("hundido");

      expect(partida.esFinal()).toEqual(true);
      //expect(partida.fase).toEqual("final");
      expect(us2.flotaHundida()).toEqual(true);
      expect(us1.flotaHundida()).toEqual(false);
    });

    it("Comprobar el cambio de turno", function () {
      us1.disparar(3, 0);
      expect(partida.turno.nick).toEqual("luis");
    });

    it("Comprobar que no deja disparar sin turno", function () {
      us2.disparar(0, 0);
      expect(us1.flota["b2"].estado).toEqual("intacto");
    });
  });

});