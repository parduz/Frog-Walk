const canzoni_di_prova = [
	{ titolo: "AFTER THE ORDEAL"     , BPM: 100 , beats: 4 , pattern_kick:  "C-C-C-C-",
	                                                         pattern_snare: "-R-R-R-R",
	                                                         pattern_hihat: "HHHHHHHH"
	                                                                                          },
	{ titolo: "BACK IN URSS"         , BPM:  50 , beats: 4 , pattern_kick:  "C-C-C-C-",
	                                                         pattern_snare: "-R-R-R-R",
	                                                         pattern_hihat: "HHHHHHHH"
	                                                                                          },
	{ titolo: "BELIEVER"             , BPM: 120 , beats: 4 },
	{ titolo: "COME TOGETHER"        , BPM: 130 , beats: 4 },
	{ titolo: "CROCODILLE ROCK"      , BPM: 140 , beats: 4 },
	{ titolo: "FLASH"                , BPM: 150 , beats: 4 },
	{ titolo: "FORTUNA"              , BPM: 160 , beats: 4 },
	{ titolo: "GENERALE"             , BPM: 170 , beats: 4 },
	{ titolo: "GET BACK"             , BPM: 180 , beats: 4 },
	{ titolo: "GIOCO BIMBA COLLAGE"  , BPM: 190 , beats: 4 },
	{ titolo: "HAVE YOU EVER"        , BPM: 120 , beats: 4 },
	{ titolo: "JOY"                  , BPM: 120 , beats: 4 },
	{ titolo: "LUCKY MAN"            , BPM: 120 , beats: 4 },
	{ titolo: "MELLOW YELLOW"        , BPM: 120 , beats: 4 },
	{ titolo: "MONNALISA"            , BPM: 120 , beats: 4 },
	{ titolo: "NARCOTIC"             , BPM: 120 , beats: 4 },
	{ titolo: "PROUD MARY"           , BPM: 120 , beats: 4 },
	{ titolo: "SAMBA PA TI"          , BPM: 120 , beats: 4 },
	{ titolo: "SATISFACTION"         , BPM: 120 , beats: 4 },
	{ titolo: "SATURDAY NIGTH"       , BPM: 120 , beats: 4 },
	{ titolo: "SHE CAME THROUGH"     , BPM: 120 , beats: 4 },
	{ titolo: "SUMMERTIME BLUES"     , BPM: 160 , beats: 4 , pattern_kick:  "C---C---",
	                                                         pattern_snare: "--RR--R-",
	                                                         pattern_hihat: "HHHHHHHH"
	                                                                                          },
	{ titolo: "SURF IN USA"          , BPM: 120 , beats: 4 },
	{ titolo: "SWEET HOME CHICAGO"   , BPM: 120 , beats: 4 },
	{ titolo: "WE HAVE ALL THE TIME" , BPM: 120 , beats: 4 },
	{ titolo: "WHO'LL STOP THE RAIN" , BPM: 120 , beats: 4 },
	{ titolo: "ZARATHUSTRA"          , BPM: 120 , beats: 4 }
];
var ListaCanzoni;

//-----------------------------------------------------------------------------------------------------------------------------
var buffer           = [];			// L'output HTML da mostrare sulla pagina
var skipClick        = false;		// Vero quando è stato scrollata la lista col "drag"
//-----------------------------------------------------------------------------------------------------------------------------
//var Metronomo        = null;		// L'elemento della pagina che lampeggerà a tempo
var tempo_BPM        = 0;			// Tempo del brano in Beats per Minute
var tempo_Beats      = 0;			// Quanti quarti/ottavi per battuta
var CurrBeat         = 0;			// Beat corrente (da 1 a Beats, 0 è un valore non valido).
var ms_quarto        = 0;			// Durata in ms di un quarto
var CanzoneCorrente  = "";			// Canzone correntemente visualizzata
//-----------------------------------------------------------------------------------------------------------------------------

var SimpleAnimation      = false;		// Seleziona l'animazione CSS o no per il metronomo

// Variabili usate se non si usa l'animazione CSS
var intID_Metronomo  = null;		// ID dell'interval attivato per il Metronomo

var usaDrumLoop      = false;		// Seleziona se usare l'animazione della batteria
// Variabili usate per l'animazione della Batteria
var ms_ottavo        = 0;			// Durata in ms di un ottavo
var ms_sedicesimi    = 0;			// Durata in ms di un sedicesimi
var stepCount        = 0;			// Numero di step necessari alla rappresentazione del ritmo
var current_step     = 0;
var step_per_quarto  = 0;

// Check if the user is accessing the page on a mobile device
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

document.addEventListener('DOMContentLoaded', function () {
	const ele = document.getElementById('ListaCanzoni');
	ele.style.cursor = 'grab';

	let pos = { top: 0, left: 0, x: 0, y: 0 };

	const mouseDownHandler = function (e) {
		//console.log ("MouseDown");
		ele.style.cursor = 'grabbing';
		ele.style.userSelect = 'none';

		pos = {
			left: ele.scrollLeft,
			top: ele.scrollTop,
			// Get the current mouse position
			x: e.clientX,
			y: e.clientY,
		};

		document.addEventListener('mousemove', mouseMoveHandler);
		document.addEventListener('mouseup', mouseUpHandler);
	};

	const mouseMoveHandler = function (e) {
		// How far the mouse has been moved
		const dx = e.clientX - pos.x;
		const dy = e.clientY - pos.y;

		if (dy>10 || dy<-10 || skipClick) {
			skipClick = true;
			// Scroll the element
			ele.scrollTop = pos.top - dy;
		}else{
			//console.log (pos.top + " - " + dy);
		}
	};

	const mouseUpHandler = function () {
		ele.style.cursor = 'grab';
		ele.style.removeProperty('user-select');

		document.removeEventListener('mousemove', mouseMoveHandler);
		document.removeEventListener('mouseup', mouseUpHandler);
		//console.log ("MouseUp");
	};
	// Attach the handler
	ele.addEventListener('mousedown', mouseDownHandler);


	if (usaDrumLoop) {
		DrumBack.style.display = "block";
	} else {
		DrumBack.style.display = "none";
	}

	if (isMobile) {
		SimpleAnimation = true;
		document.getElementById('ANIM').style.display = "none";
	}

	// https://stackoverflow.com/questions/807878/how-to-make-javascript-execute-after-page-load
	canzoniDiv.innerHTML = CreaListaCanzoni(canzoni);
//	VisualizzaCanzone(0);
	GestisciClicks();

});
//-----------------------------------------------------------------------------------------------------------------------------
function GestisciClicks() {
	// Checkbox toggle functionality
	const item = document.querySelectorAll(".song-name");
	item.forEach(function (el) {
		el.onclick = function () {
//			console.log("Click");
			if (this.id == "ANIM") {
				SimpleAnimation = !SimpleAnimation;
				VisualizzaCanzone(-1);
				return;
			}
			if (skipClick) {
				skipClick = false;
			}else{
				VisualizzaCanzone(this.id);
			}
		}
	});
}
//-----------------------------------------------------------------------------------------------------------------------------
function VisualizzaCanzone(index) {

	if (index>=0 && index<ListaCanzoni.length) {
		CanzoneCorrente = ListaCanzoni[index];
	}
	if (!CanzoneCorrente) return;

	buffer = [];
	// Apriamo la nuova sezione, ci scriviamo quel che dobbiamo, e la chiudiamo
	Titolo.innerHTML = CanzoneCorrente.titolo + " ("+ CanzoneCorrente.BPM + ")";
	ImpostaMetronomo(CanzoneCorrente.BPM, CanzoneCorrente.beats);
}

//-----------------------------------------------------------------------------------------------------------------------------
// Esamina l'intera lista delle canzoni e crea l'elenco e l'array dei tempi
//-----------------------------------------------------------------------------------------------------------------------------
function CreaListaCanzoni(Canzoni) {
	buffer = [];
	if (!Canzoni) ListaCanzoni = canzoni_di_prova;
	else ListaCanzoni = Canzoni;

	if (!ListaCanzoni) return "";					// Non c'è nulla da fare, usciamo
	ListaCanzoni.forEach((canzone, index) => {
//		buffer.push('<p class="song-name" id="' + index + '">' + canzone.titolo +'</p>\n');
		buffer.push('<p class="song-name" id="' + index + '">' + canzone.titolo + '<span>' + canzone.BPM + '</span>' + '</p>\n');
	});
	return buffer.join("\n");
}
//-----------------------------------------------------------------------------------------------------------------------------


//-----------------------------------------------------------------------------------------------------------------------------
function ImpostaMetronomo(newBPM, newBeats) {

	tempo_BPM=newBPM;
	tempo_Beats=newBeats;
	CurrBeat = -1;
	if (tempo_BPM==0 || tempo_Beats==0) return;

	if (!Metronomo) return;

	// RESETTONE GENERALE
	clearInterval(intID_Metronomo);
	intID_Metronomo = null; // release our intervalID from the variable
	// Fermiamo l'animazione CSS e cancelliamo i listener agli eventi
	Metronomo.style.animationPlayState = 'paused';
	Metronomo.removeEventListener("animationend", TickMetronomo);
	Metronomo.removeEventListener("animationiteration", TickMetronomo);

	// Togliendo tutte le classi al metronomo, diventa ... neutro.
	Metronomo.className = "";
	CurrBeat  = -1

	// Calcoliamo quanto dura 1/4 in millisecondi
	ms_quarto     = 60000/tempo_BPM;

	if (SimpleAnimation) {
		// Non usiamo l'animazione CSS, usiamo un semplice cambio colore
		// Quindi usiamo un "interval" per chiamare la funzione ogni 1/4
		intID_Metronomo = setInterval(TickMetronomo, ms_quarto);
	}else{
		// Usiamo l'animazione CSS figa e con la sfumata
		// È l'animazione stessa a generare l'evento che chiama TickMetronomo
		Metronomo.classList.add("animated");

		// Impostiamo i tempi dell'animazione
		var CSSRoot = document.querySelector(':root'); // Get the root element
		CSSRoot.style.setProperty('--bpm'  , tempo_BPM);
		CSSRoot.style.setProperty('--beats', tempo_Beats);
		CSSRoot.style.setProperty('--beat-duration',ms_quarto +'ms');

		// Creiamo i listener agli eventi della animazione
		Metronomo.addEventListener("animationend", TickMetronomo);
		Metronomo.addEventListener("animationiteration", TickMetronomo);
		// e infine, avviamo l'animazione.
		Metronomo.style.animationPlayState = 'running';
	}
	// Chiamiamo ora il Tick, così visualizziamo subito il primo quarto.
	TickMetronomo();
}
//-----------------------------------------------------------------------------------------------------------------------------
function TickMetronomo() {
	var animationName = "";
	if (++CurrBeat>tempo_Beats || CurrBeat<1) CurrBeat = 1;
	animationName = CurrBeat==1?'b1':'b2';	// Colore diverso per il primo quarto
	Metronomo.innerText = CurrBeat;			// Scriviamo il quarto corrente
	if (SimpleAnimation) {
		Metronomo.className = animationName;
		setTimeout(function () {	// il timeout serve a spegnere lo sfondo dopo un po'
			Metronomo.classList.remove(animationName);
		}, 80);
	}else{
		Metronomo.style.animationName = animationName;
	}
}


//-----------------------------------------------------------------------------------------------------------------------------
function ImpostaDrumLoop() {
	if (SimpleAnimation) {
	current_step  = -1;
		ms_quarto     = 60000/tempo_BPM;
		ms_ottavo     = ms_quarto/2;
		ms_sedicesimi = ms_ottavo/2;

		stepCount = -1
		if (CanzoneCorrente.pattern_kick) stepCount = CanzoneCorrente.pattern_kick.length;
		if (stepCount<0) stepCount = tempo_Beats;

		var ms_step = ms_quarto;
		step_per_quarto = 1;
		if (stepCount>=tempo_Beats*4) {
			ms_step = ms_sedicesimi;
			step_per_quarto = 4;
		}else if (stepCount>=tempo_Beats*2) {
			ms_step = ms_ottavo;
			step_per_quarto = 2;
		}
		intervalID = setInterval(DrumLoop, ms_step);
		DrumLoop();
		return;
	}
}
//-----------------------------------------------------------------------------------------------------------------------------

function DrumLoop() {
	// Gestione dello step corrente (lo step può essere 1/4, 1/8 o 1/16, determinato da stepCount)
	var previous_step = current_step;
	if (current_step  <0 || current_step  >= (stepCount-1) ) current_step = 0;
	else ++current_step;


	// --- Drumkit ---------------------------------------------------------------------------------
	if (previous_step <0 || previous_step >= (stepCount-1)) {
		// inizializzazione
		Drums[0].classList.remove ("DrumOn");
		Drums[1].classList.remove ("DrumOn");
		Drums[2].classList.remove ("DrumOn");
		Drums[3].classList.remove ("DrumOn");
	}
	if (CanzoneCorrente.pattern_kick && CanzoneCorrente.pattern_kick[current_step] != "-") {
		Drums[0].classList.add   ("DrumOn");
	}else Drums[0].classList.remove("DrumOn");
	if (CanzoneCorrente.pattern_snare && CanzoneCorrente.pattern_snare[current_step] != "-") {
		Drums[1].classList.add   ("DrumOn");
	}else Drums[1].classList.remove("DrumOn");
	if (CanzoneCorrente.pattern_hihat && CanzoneCorrente.pattern_hihat[current_step] != "-") {
		Drums[2].classList.add   ("DrumOn");
	}else Drums[2].classList.remove("DrumOn");
	if (CanzoneCorrente.pattern_toms && CanzoneCorrente.pattern_toms[current_step] != "-") {
		Drums[3].classList.add   ("DrumOn");
	}else Drums[3].classList.remove("DrumOn");
	setTimeout(function () {	// il timeout serve a spegnere lo sfondo dopo 1/16
		Drums[0].classList.remove("DrumOn");
		Drums[1].classList.remove("DrumOn");
		Drums[2].classList.remove("DrumOn");
		Drums[3].classList.remove("DrumOn");
	}, 40);
}
