const fs=require("fs");
const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const modelo = require("./servidor/modelo.js");
const sWS = require("./servidor/servidorWS.js");

const PORT = process.env.PORT || 3000;
var args = process.argv.slice(2);

let juego = new modelo.Juego(args[0]); 
let servidorWS = new sWS.ServidorWS();

const passport = require("passport");

const cookieSession=require("cookie-session");
require("./servidor/passport-setup.js");

//hacer 'npm install passport' --> Y en el package.json

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

app.get("/auth/google",passport.authenticate('google', { scope: ['profile','email'] }));

// "auth/github"
// "auth/twitter"

app.use(cookieSession({
  name: 'Batalla naval',
  keys: ['key1', 'key2']
}));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", function(request,response){
	var contenido=fs.readFileSync(__dirname+"/cliente/index.html");
	response.setHeader("Content-type","text/html");
	response.send(contenido);
});

//Puede que haga falta modificarlo
app.get("/auth/google",passport.authenticate('google', { scope: ['profile','email'] }));

app.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/fallo' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/good');
});

app.get("/good", function(request,response){
  var nick=request.user.emails[0].value;
  if (nick){
    juego.agregarUsuario(nick);
  }
  response.cookie('nick', nick);
  response.redirect('/');
});

app.get("/fallo",function(request,response){
  response.send({nick:"nook"})
})


app.get("/agregarUsuario/:nick", function(request, response){
  let nick = request.params.nick;
  let res = juego.agregarUsuario(nick);
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
  response.send({res:"ok"});
});

app.get("/obtenerLogs", function(request, response){
  juego.obtenerLogs(function(logs){
    response.send(logs);
  });
});

app.get("/comprobarUsuario/:nick", function(request, response){
  let nick = request.params.nick;
  let us = juego.obtenerUsuario(nick);
  let res = {"nick": -1};
  if(us){
    res.nick = us.nick;
  }
  response.send(res);
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