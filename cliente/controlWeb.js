function ControlWeb(){
	this.comprobarCookie=function(){
		if ($.cookie("nick")){
			rest.nick=$.cookie("nick");	
			rest.comprobarUsuario();		
			// cws.conectar();
			// this.mostrarHome();
		}
		else{
			this.mostrarAgregarUsuario();
		}
	}
	this.mostrarAgregarUsuario=function(){
		// let cadena= '<div class="row" id="mAU">';//'<form class="form-row needs-validation"  id="mAJ">';
		// cadena=cadena+"<div class='col'>";
		// cadena=cadena+'<div class="row"><div class="col"><h2>El juego indefinido</h2></div></div>';
		// cadena=cadena+'<div class="row">';
		// cadena=cadena+'<div class="col">'
  //       cadena=cadena+'<input type="text" class="form-control mb-2 mr-sm-2" id="usr" placeholder="Introduce tu nick (max 6 letras)" required></div>';
  //       cadena=cadena+'<div class="col">';
  //       cadena=cadena+'<button id="btnAU" class="btn btn-primary mb-2 mr-sm-2">Iniciar sesión</button>';
  //       //cadena=cadena+'<a href="/auth/google" class="btn btn-primary mb-2 mr-sm-2">Accede con Google</a>';
  //       cadena=cadena+'</div>'; //' </form>';
  //       cadena=cadena+'<div id="nota"></div>';
  //       cadena=cadena+'</div></div></div>';
		$('#mH').remove();
		$('#mAU').remove();
  		let cadena= '<div id="mAU">';
  		//cadena=cadena+"<h2>Batalla naval</h2>";
  		//cadena=cadena+"<h6>La última sensación en juegos Web</h6>";
  		//cadena=cadena+'<p><img src="cliente/img/wisconsin.webp" class="rounded" style="width:30%;" alt="Wisconsin">';
  		cadena=cadena+'<div class="card" style="width:75%;">';
		cadena=cadena+'<div class="card-body">';
		cadena=cadena+'<h2 class="card-title">Batalla naval</h2>';
		cadena=cadena+'<p class="card-text">Juego para 2 jugadores. Introduce un nick</p>';
		//cadena=cadena+'<a href="#" class="btn btn-primary">Ver resultados</a>';
		cadena=cadena+'<input type="text" class="form-control mb-2 mr-sm-2" id="usr" style="width:100%;" placeholder="Introduce un nick (max 6 letras)" required>';
  		cadena=cadena+'<button id="btnAU" class="btn btn-primary mb-2 mr-sm-2">Entrar</button>';
		cadena=cadena+'</div>';
		cadena=cadena+'<img class="card-img-bottom" src="cliente/img/armada.webp" alt="imagen barco" style="width:100%">'
		cadena=cadena+'</div>'
  		//cadena=cadena+'<p><img src="cliente/img/barco.jpg" class="rounded" style="width:40%;" alt="Wisconsin"></p>';
      	//cadena=cadena+'<h6>Accede al juego con sólo introducir un nick</h6>';  		
		$("#agregarUsuario").append(cadena);     
		//$("#nota").append("<div id='aviso' style='text-align:right'>Inicia sesión con Google para jugar</div>");    

		$("#btnAU").on("click",function(e){
			if ($('#usr').val() === '' || $('#usr').val().length>6) {
			    e.preventDefault();
			    $('#nota').append('Nick inválido');
			}
			else{
				var nick=$('#usr').val();
				$("#mAU").remove();
				//$("#aviso").remove();
				rest.agregarUsuario(nick);
				//mostrar gif
			}
		})
	}
	this.mostrarHome=function(){
		$('#mH').remove();
		let cadena="<div class='row' id='mH'>";
		cadena=cadena+'<div class="col">';
		cadena=cadena+"<h2>Bienvenido "+rest.nick+"</h2>";
		cadena=cadena+'<button id="btnSalir" class="btn btn-primary mb-2 mr-sm-2">Salir</button>';
		cadena=cadena+"<div id='codigo'></div>"
		cadena=cadena+"</div></div>";
		$('#agregarUsuario').append(cadena);
		this.mostrarCrearPartida();
		rest.obtenerListaPartidasDisponibles();
		$("#btnSalir").on("click",function(e){		
			$("#mCP").remove();
			$('#mLP').remove();
			$('#mH').remove();
			rest.usuarioSale();
			cws.salir();
		});
	}
	this.salir=function(nick){
		iu.mostrarModal("Hasta la próxima");
		$.removeCookie("nick");
		iu.comprobarCookie();
	}
	this.mostrarCrearPartida=function(){
		$('#mCP').remove();
		// let cadena= '<div class="row" id="mCP">';
  //       cadena=cadena+'<div class="col">';
  //       cadena=cadena+'<button id="btnCP" class="btn btn-primary mb-2 mr-sm-2">Crear partida</button>';
  //       cadena=cadena+'</div>';
  //       cadena=cadena+'</div>';

        let cadena='<div class="card" id="mCP">';
	  	cadena=cadena+'<div class="card-body">'
	    cadena=cadena+'<h4 class="card-title">Crear partida</h4>';
	    cadena=cadena+'<p class="card-text">Crea una nueva partida y espera rival.</p>';
	    //cadena=cadena+'<a href="#" class="card-link">Card link</a>'	    
	    cadena=cadena+'<button id="btnCP" class="btn btn-primary mb-2 mr-sm-2">Crear partida</button>';
	  	cadena=cadena+'</div>';

        $('#crearPartida').append(cadena);
        $("#btnCP").on("click",function(e){		
			$("#mCP").remove();
			$('#mLP').remove();
			//rest.crearPartida();
			cws.crearPartida();
		});
	}
	this.mostrarCodigo=function(codigo){
		let cadena="<div id='mCodigoPartida'><p>Código de la partida: "+codigo+"</p>";
		cadena=cadena+'<button id="btnAP" class="btn btn-primary mb-2 mr-sm-2">Abandonar partida</button>';
		cadena=cadena+"</div>";

		$('#codigo').append(cadena);
		$('#btnAP').on("click",function(e){
			cws.abandonarPartida();
			iu.finPartida();
		});
	}
	this.finPartida=function(){
		$("#mCodigoPartida").remove();
		$('#gc').remove();
		cws.codigo=undefined;
		tablero=new Tablero(10);
		//tablero.mostrar(false);
		iu.mostrarHome();
	}
	this.mostrarListaDePartidas=function(lista){
		$('#mLP').remove();
		let cadena="<div id='mLP'>";		
		cadena=cadena+'<ul class="list-group">';
		for(i=0;i<lista.length;i++){
		  cadena = cadena+'<li class="list-group-item">'+lista[i].codigo+' propietario: '+lista[i].owner+'</li>';
		}
		cadena=cadena+"</ul>";
		cadena=cadena+"</div>"
		$('#listaPartidas').append(cadena);
		
	}
	this.mostrarListaDePartidasDisponibles=function(lista){
		$('#mLP').remove();
		let cadena="<div class='row' id='mLP'>";
		cadena=cadena+"<div class='col'>";
		cadena=cadena+"<h2>Lista de partidas disponibles</h2>";
		//cadena=cadena+'<button id="btnAL" class="btn btn-primary mb-2 mr-sm-2">Actualizar</button>';
		cadena=cadena+'<ul class="list-group">';
		for(i=0;i<lista.length;i++){
		  cadena = cadena+'<li class="list-group-item"><a href="#" value="'+lista[i].codigo+'"> Nick propietario: '+lista[i].owner+'</a></li>';
		}
		cadena=cadena+"</ul>";
		cadena=cadena+"</div></div>"
		$('#listaPartidas').append(cadena);

		$(".list-group a").click(function(){
	        codigo=$(this).attr("value");
   	        console.log(codigo);
	        if (codigo){
	            $('#mLP').remove();
	            $('#mCP').remove();
	            //rest.unirseAPartida(codigo);
	            cws.unirseAPartida(codigo);
	        }
	    });		
	    $("#btnAL").on("click",function(e){		
			rest.obtenerListaPartidasDisponibles();
		})
	}
	this.mostrarModal=function(msg){
		$('#mM').remove();
		var cadena="<p id='mM'>"+msg+"</p>";
		$('#contenidoModal').append(cadena);
		$('#miModal').modal("show");
	}
}