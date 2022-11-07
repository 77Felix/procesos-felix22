const fs=require("fs");
const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const modelo = require("./servidor/modelo.js");
const sWS = require("./servidor/servidorWS.js");

const PORT = process.env.PORT || 3000;

let juego = new modelo.Juego(); 
let servidorWS = new sWS.ServidorWS();

//HTTP GET POST PUT DELETE
/*
get "/"
get "/obtenerPartidas"
post get "/agregarUsuario/:nick"      -----> 'post' para enviar información; 'get' si se envía muy poca información
put "/actualizarPartida"              -----> 'put' para actualizar
delete "/eliminarPartida"             -----> 'delete' para eliminar
...
*/

/*app.get('/', (req, res) => {
  res
    .status(200)
    .send("Hola")
    .end();
});*/

app.use(express.static(__dirname + "/"));

app.get("/", function(request,response){
	var contenido=fs.readFileSync(__dirname+"/cliente/index.html");
	response.setHeader("Content-type","text/html");
	response.send(contenido);
});

app.get("/agregarUsuario/:nick", function(request, response){
  let nick = request.params.nick;
  let res;
  res = juego.agregarUsuario(nick);
  response.send(res); //Esto conecta con el clienteRest.js
});

app.get("/crearPartida/:nick", function(request, response){
  let nick = request.params.nick;
  let res = juego.jugadorCreaPartida(nick);
  response.send(res);
})

app.get("/unirseAPartida/:nick/:codigo", function(request, response){
  let nick = request.params.nick;
  let codigo = request.params.codigo;

  let res = juego.jugadorSeUneAPartida(nick, codigo);
  response.send(res);
});

app.get("/obtenerPartidas", function(request, response){
  let lista = juego.obtenerPartidas();
  response.send(lista);
});

app.get("/obtenerPartidasDisponibles", function(request, response){
  //calcular la lista aquí
  let lista = juego.obtenerPartidasDisponibles();
  response.send(lista);
});

app.get("/salir/:nick",function(request,response){
  let nick=request.params.nick;
  juego.usuarioSale(nick);
  response.send({res:"ok"})
});

// Start the server

/*app.listen(PORT, () => {
  console.log(`App está escuchando en el puerto ${PORT}`);
  console.log('Ctrl+C para salir');
});*/

server.listen(PORT, () => {
  console.log(`App está escuchando en el puerto ${PORT}`);
  console.log('Ctrl+C para salir');
});

//Lanzamos el servidorWS
servidorWS.lanzarServidorWS(io, juego);