const canzone_di_prova = `
--tempo: 120, 4--
--titolo: Testo di prova--
--sottotitolo: canzone finta--
--intro: Intro Riff:--
[Do] [Re] [Mi] [Fa] [Sol] [La] [Si]

--strofa--
[La-]Questo è un LA minore [Si-]Invece questo è un SI
[La#]Possiamo usare i diesis [Sib]e i bemolli

--Commento: questo è un commento da visualizzare--
# mentre questo commento non viene visualizzato

--ritornello--
[La]Ullallà ullallà [Re]ullallallà
[Mi7]questo è il valzer del mosce[LA]rinoooo!

--Solo: Assolo di Bruno--

--Solo: Assolo di Andrea--
[Do] [Re] [Mi]    [Fa] [Sol] [La] [Si]

--ritornello--
[La]Ullallà ullallà [Re]ullallallà
[Mi7]questo è il valzer del mosce[la]rinoooo!

--finale--
[La]La [Si]Si [Do]Do [Re]Re [Mi]Mi [Fa]Fa [Sol]Sol
[La4]La4 [Si/Re]Si/Re [Do]Do [Re]Re [Mi]Mi[Fa]Fa[Sol4]Sol4

`;

//-----------------------------------------------------------------------------------------------------------------------------
var buffer           = [];			// L'output HTML da mostrare sulla pagina
var currSection      = "verse";		// Tipo di sezione in cui stiamo mettendo il testo
var sectionOpened    = false;		// Quando è falsa, bisogna aprire una nuova sezione
var LyricsOverflowed = false;		// Vero quando il testo non sta nella finestra e stiamo andando a capo
//-----------------------------------------------------------------------------------------------------------------------------
var Metronomo        = null;		// L'elemento della pagina che lampeggerà a tempo
var TestoMetronomo   = null;		// L'elemento della pagina che mostra il beat corrente
var tempo_BPM        = 0;			// Tempo del brano in Beats per Minute
var tempo_Beats      = 0;			// Quanti quarti/ottavi per battuta
var CurrBeat         = 0;			// Beat corrente (da 1 a Beats, 0 è un valore non valido).
//-----------------------------------------------------------------------------------------------------------------------------


//-----------------------------------------------------------------------------------------------------------------------------
function FormatChords(ChordsString) {
	var findreplace = {
	  "do" :"DO",
	  "re" :"RE",
	  "mi" :"MI",
	  "fa" :"FA",
	  "sol":"SOL",
	  "la" :"LA",
	  "si" :"SI",
	  "#"  :"&sharp;",
	  "b"  :"&flat;"
	};

	return ChordsString.replace(
			  new RegExp("(" + Object.keys(findreplace).map(function(i){
			    return i.replace(/[.?*+^$[\]\\(){}|-]/gi, "\\$&")
			  }).join("|") + ")", "g"),
			  function(s){ return findreplace[s]}
			);
}
//-----------------------------------------------------------------------------------------------------------------------------

function insertStringAt(strOrig,index,strInsert) {
	return strOrig.slice(0, index) + strInsert + strOrig.slice(index);
}

//-----------------------------------------------------------------------------------------------------------------------------
// Ritorna true se la stringa passata è più lunga dello spazio a disposizione
//-----------------------------------------------------------------------------------------------------------------------------
function IsStringOverflow(StringToMeasure) {
	m_div.innerText = StringToMeasure;
	return (m_div.clientWidth<m_div.scrollWidth);
}
//-----------------------------------------------------------------------------------------------------------------------------
function GetStringOverflowIndex(StringToMeasure) {
	if (IsStringOverflow(StringToMeasure)==false) {
		// Ci sta, molto bene;
		return -1;
	}
	// NO, dobbiamo trovare dove andare a capo
	// Spezziamo il testo nelle singole parole (compresi gli spazi)
	// https://stackoverflow.com/questions/17726904/javascript-splitting-a-string-yet-preserving-the-spaces
	var SplitWords = StringToMeasure.split(/(\S+\s+)/).filter(function(n) {return n});
	var tempStr = '';
	for (w=0; w<SplitWords.length; w++) {
		if (IsStringOverflow(tempStr + SplitWords[w])) {
			// Ok, a partire da questa parola non ci stiamo più
			return tempStr.length;
		}else{
			// Questa parola ci sta
			tempStr += SplitWords[w];
		}
	}
	return -1;
}
//-----------------------------------------------------------------------------------------------------------------------------
function CheckStringOverflow(l,NewWords) {
	if (IsStringOverflow(l.lyrics + NewWords)==false) {
		// Ci sta, molto bene;
		l.words = NewWords;
		return false;
	}
	// NO, dobbiamo trovare dove andare a capo
	// Spezziamo il testo nelle singole parole (compresi gli spazi)
	// https://stackoverflow.com/questions/17726904/javascript-splitting-a-string-yet-preserving-the-spaces
	var SplitWords = NewWords.split(/(\S+\s+)/).filter(function(n) {return n});

	for (w=0; w<SplitWords.length; w++) {
		if (IsStringOverflow(l.lyrics + l.words + SplitWords[w])) {
			// Ok, a partire da questa parola non ci stiamo più
			// Dobbiamo flushare tutto quel che segue per poi ri-esaminarlo andando a capo
			l.flushed = l.flushed + SplitWords.slice(w).join("");
			break;
		}else{
			// Questa parola ci sta
			l.words = l.words + SplitWords[w];
		}
	}
	return true;
}
//-----------------------------------------------------------------------------------------------------------------------------

//-----------------------------------------------------------------------------------------------------------------------------
function parseSection(matched) {
	//ADD COMMAND PARSING HERE
	//reference: http://tenbyten.com/software/songsgen/help/HtmlHelp/files_reference.htm
	// implement basic formatted text sections
	var section = "";
	var text    = "";
	var wrap    = "";
	var elID    = "";
	var nextSection = "";
	var dontClose = false;
	if( matched.length >= 3 ) text = matched[2];

	switch( matched[1].toLowerCase() ) {
		case "titolo":
		case "title":
			section = "title";
			wrap = "h1";
			elID = "title"
			break;
		case "sottotitolo":
		case "subtitle":
			section = "subtitle";
			wrap = "h4";
			break;
		case "commento":
		case "comment":
			section = "comment";
			wrap    = "em";
			break;

		case "strofa":
		case "verse":
			nextSection = "verse";
			break;
		case "ritornello":
		case "chorus":
			nextSection = "chorus";
			break;
		case "intro":
			nextSection = "intro";
			section = "intro";
			dontClose = true;
			break;
		case "ponte":
		case "bridge":
			nextSection = "bridge";
			break;
		case "solo":
			nextSection = "solo";
			section = "solo";
			dontClose = true;
			break;
		case "finale":
		case "ending":
			nextSection = "ending";
			break;
		case "note":
			nextSection = "note";
			break;

		case "tempo":
			if (text=="") break;	// Dobbiamo avere il tempo e i beats
			var virgola = text.indexOf(',');
			if (virgola<2) break;	// Se non c'è la virgola, o è troppo vicina all'inizio, è robaccia
			tempo_BPM   = text.substring(0,virgola);
			tempo_Beats = text.substring(virgola+1,1000);
			section     = "";
			text        = "";
			wrap        = "";
			elID        = "";
			nextSection = "";

			break;

		default:
			// Cos'è 'sta roba?
			// Per non saper ne leggere ne scrivere ... la scrivo così come l'ho trovata.
			section = "unknown";
			wrap    = "em";
			text    = matched[0];
			break;
	}	// Fine switch Sezione

	// Se dobbiamo creare un nuovo elemento, oppure abbiamo cambiato tipo di sezione, oppure dobbiamo scrivere qualcosa:
	if( wrap || (nextSection && currSection!=nextSection) || text) {
		// Se stavamo già facendo qualcosa, lo chiudiamo.
		if (buffer.length || sectionOpened ) buffer.push('</div>\n');
		sectionOpened = false;	// Dopo dovremo aprirne una nuova
		// Se è cambiato il tipo di sezione, la salviamo
		if (nextSection) {
			currSection = nextSection;
		}
		if (wrap || text) {
			// Apriamo la nuova sezione, ci scriviamo quel che dobbiamo, e la chiudiamo
			buffer.push(
			  '<div class="section_block' +
			  (section?(' ' + section)       :'') +
			  '"' +
			  (elID?   (' id="' + elID + '"'):'') +
			  '>'
			  +
			  '\n'
			);
buffer.push('<p class="debug">' + matched + '</p>\n');

			buffer.push(
			  (wrap?('<' + wrap +
			    (section?(' class="' + section + '"'):'') +
			  '>'):'') +
			  text +
			  (wrap?('</' + wrap + '>'):'') +
			  (dontClose?'':'</div>\n')
			);

			if (dontClose==false)  buffer.push('</div>\n');

			if (dontClose) sectionOpened = true;
		}else{
buffer.push('<p class="debug">' + matched + '</p>\n');
		}
	}else{
buffer.push('<p class="debug">' + matched + '</p>\n');
	}

}
//-----------------------------------------------------------------------------------------------------------------------------

//-----------------------------------------------------------------------------------------------------------------------------
function parseLyricsAndChords(l) {
	var chordregex      = /(\[[^\]]*\])/;			// La ricerca di tutto quello compreso tra le parentesi quadre
	var originalChord   = "";
	var chord           = "";
	var halfWord        = "";
	var halfWordLen     = 0;
	var FlushRemaining  = false;
	//var LyricsAndChords = ['','',''];
	var lenWordsToAdd   = 0;

	var chordspan_Position   = 0;
	var chordspan_chord      ='';
	var chordspan_originalChord = '';

	var line = l.flushed;
	l.flushed = '';
	if (line.trim()=='') return;

	// Testo e/o accordi
	if(!sectionOpened) {
		// Apriamo una nuova sezione di "Testo/Accordi"
		buffer.push('<div class="lyric_block ' + currSection + (LyricsOverflowed?' acapo':'') + '">');
		sectionOpened = true;
	}

	if (line.match(chordregex)) {
		// Se all'interno della linea troviamo le parentesi quadre, vuol dire che ci sono degli accordi.

		// Dividiamo la linea, "tagliando" ad ogni accordo
		line.split(chordregex).forEach(function(currentString, index, array) {

			// Se prima abbiamo deciso d'andare a capo, dobbiamo solo accodare tutto per il successivo "riesame"
			if (FlushRemaining) {
				l.flushed = l.flushed + currentString;
				return;
			}

			// Se l'indice del pezzetto di linea è pari, allora dovrebbe essere testo.
			if ((index % 2) == 0) {
				if (currentString=='') {
					// Caso particolare: se abbiamo un accordo precedente, allora forse ci sono
					// due accordi vicini senza uno spazio tra loro, quindi aggiungiamo uno spazio al
					// testo e proseguiamo normalmente,
					if (originalChord) {
						currentString=' ';
					}else if(index==0) {
						// La prima roba scritta è un accordo, quindi niente testo.
						return;
					}
					else{
						alert("Che brutto casino");
					}
				}
				// "currentString" contiene sicuamente un pezzetto di testo

				// Dobbiamo controllare che un accordo non abbia diviso in due una parola, altrimenti
				// rischiamo di andare a capo proprio lì in mezzo.
				// Lo facciamo guardando se ci sono spazi all'inizio o alla fine del pezzetto di testo
				// che abbiamo in "currentString".

				// Se avevamo già trovato qualcosa, accodiamo tutto e ricontrolliamo
				if (halfWord!='') {
					chordspan_Position = halfWord.length;	// Salviamo la posizione in cui inserire l'accordo
					currentString = halfWord + currentString;
					halfWord="";	// L'abbiamo usata, la si resetta
				}
				if (index < array.length - 1) {
					// l'ultima parola è normale che non abbia spazi dopo
					if (currentString.charAt(currentString.length - 1)==" ") {
						//siamo a posto
					}else{
						// parola troncata: salviamo quel che abbiamo e vediamo al prossimo gire
						halfWord = currentString;
						return;
					}
				}

				// Ora controlliamo se dobbiamo andare a capo
				l.words='';
				FlushRemaining = CheckStringOverflow(l,currentString);
				lenWordsToAdd = l.words.length;
				if (FlushRemaining) {
					LyricsOverflowed = true;	// serve solo al debug
				}

				// Dobbiamo controllare se avevamo una parola troncata, se l'accordo sta
				// in questa riga o in quella a capo, e cosa flushare per il prossimo giro.

				// Se le parole da aggiungere sono più lunghe dell'accordo (compresi gli spazi aggiunti per l'eventuale parola troncata)
				// allora possiamo aggiungere anche l'accordo.
				if ( lenWordsToAdd>0 && lenWordsToAdd >= halfWordLen ) {
					// Togliamo le parentesi quadre dall'accordo (se c'è)
					if (originalChord!='') {
						chord = originalChord.replace(/(\[|\])/g, '');
						chordspan_chord = FormatChords(chord);
						chord = " ".repeat(halfWordLen) + chord; // aggiungiamo gli eventuali spazi per la parola troncata
					}
				}else{
					// altrimenti significa che dobbiamo re-infilare l'accordo nelle parole flushate e guardarci
					// al prossimo giro mentre andiamo a capo

					// Calcoliamo quanti spazi rimangono da mettere per l'eventuale parola troncata
					// Inseriamo l'accordo nel testo rimasto
					l.flushed = insertStringAt(l.flushed, halfWordLen-lenWordsToAdd, originalChord);
					//var lenChordToAdd = halfWordLen-lenWordsToAdd;
					//l.flushed = l.flushed.slice(0, lenChordToAdd) + originalChord + l.flushed.slice(lenChordToAdd);
				}
				chordspan_originalChord = originalChord;
				halfWordLen = 0;	// L'abbiamo usata, la si resetta
				originalChord = '';	// L'abbiamo usata, la si resetta

				if (FlushRemaining) {
					LyricsOverflowed = true;
				}

				// Se prima avevamo un accordo, dobbiamo accodarlo.
				if (chord) {
					// se manca, aggiungiamo uno spazio per non avere due accordi attaccati
					if (l.chords && l.chords.charAt(l.chords.length - 1)!=" ") l.chords += ' ';
					l.chords = l.chords + chord;
					chord = '';	// L'abbiamo usata, la si resetta
				}

				// Accodiamo il testo a quello già trovato
				l.lyrics = l.lyrics + l.words;
				l.chordspan_lyrics += '<span class="chord" data-original-val="' + chordspan_originalChord + '">' + chordspan_chord + '</span>';
				//l.chordspan_lyrics += l.words;
				l.chordspan_lyrics += l.words.replace(/\s/g,'°');

				chordspan_originalChord = '';
				chordspan_Chord = '';

				// Ora rendiamo lunghi uguali testo ed accordi, accodando spazi se serve
				l.lyrics = l.lyrics.padEnd (l.chords.length ,' ');
				l.chords = l.chords.padEnd (l.lyrics.length ,' ');

				if (LyricsOverflowed) return;
			}
			else {
				if (currentString=='') {
					// Caso particolare:
					alert("Che orrendo casino");
					return;
				}
				// "currentString" contiene un accordo: lo salviamo e poi vediamo se ci sta col suo testo
				originalChord = currentString;
				halfWordLen = halfWord.length;	// se abbiamo trovato parole troncate, salviamo la lunghezza di quanto trovato
												// verrà usata al prossimo giro quando uniamo le due parti
			}
		}, this);	// Fine della funzione 
	}
	else {
		// Non ci sono accordi
		FlushRemaining = CheckStringOverflow(l,line);
		if (FlushRemaining) LyricsOverflowed = true;	// Se il testo è troppo lungo, andremo a capo
		l.lyrics = l.words;
	}

	// Quando arriviamo qui, abbiamo finito di esaminare e trattare testo e accordi, e ora possiamo
	// fare cose sul "risultato finale".

	// Se la riga del testo è fatta solo di spazi, e stiamo scrivendo in qualche sezione particolare, la svuotiamo.
	if (l.lyrics.trim()=='') {
		if (
		  currSection == 'intro'
		  ||
		  currSection == 'solo'
		) {
			l.lyrics='';
		}
	}
	// Ci assicuriamo di tenere lo spazio sopra al testo anche se in questa riga non ci sono accordi
	if (
	  l.lyrics!=''							// se abbiamo del testo ...
	  &&
	  l.chords==''							// ... e non abbiamo accordi ...
	  &&
	  LyricsOverflowed == FlushRemaining	// ... e non siamo (ancora) andati a capo ...
	) {
		l.chords = '<span class="chord" data-original-val="none"> </span>';	// mettiamo uno spazio negli accordi
	}

	// Metto puntini di sospensione al posto di tanti spazi, se stiamo andando a capo
	//l.lyrics = l.lyrics.replace(/\s\s+$/,'');
	//l.lyrics = l.lyrics.trim();
	if (LyricsOverflowed && FlushRemaining) {
		//l.lyrics += '&hellip;';
		l.lyrics = l.lyrics.replace(/\s$/,'&hellip;');
		l.chordspan_lyrics = l.chordspan_lyrics.replace(/\s$/,'&hellip;');
	}

l.chords = l.chords.replace(/\s/g,'°');
l.lyrics = l.lyrics.replace(/\s/g,'°');

	return;
}
//-----------------------------------------------------------------------------------------------------------------------------

function parseLyricsAndChordsSpan(l) {
	var chordregex      = /(\[[^\]]*\])/;			// La ricerca di tutto quello compreso tra le parentesi quadre
	var originalChord   = "";
	var chord           = "";
	var FlushRemaining  = false;

	var line = l.flushed;
	l.flushed = '';
	if (line.trim()=='') return;

	// Testo e/o accordi
	if(!sectionOpened) {
		// Apriamo una nuova sezione di "Testo/Accordi"
		buffer.push('<div class="lyric_block ' + currSection + (LyricsOverflowed?' acapo':'') + '">');
		sectionOpened = true;
	}

	// Guardiamo se la riga sta intera (tolti gli accordi) senza andare a capo
	var cleanline = line.replace(/\[[^\]]*\]/g,'');
	var overflowIndex = GetStringOverflowIndex(cleanline);
	var tempstr = '';
	switch (overflowIndex) {
		case -1:
			// ci sta tutta
			break;
		case 0:
			// com'è possibile?
			alert("La riga non ci sta!");
			// comunque, dobbiamo infilarla dentro.
		default:
			// No, dobbiamo andare a capo
			tempstr = cleanline.substring(0,overflowIndex);
	}
	cleanline = '';
	// Dividiamo la linea, "tagliando" ad ogni accordo
	line.split(chordregex).forEach(function(currentString, index, array) {

		// Se prima abbiamo deciso d'andare a capo, dobbiamo solo accodare tutto per il successivo "riesame"
		if (FlushRemaining) {
			l.flushed += currentString;
			return;
		}

		if (index % 2) {
			// Se l'indice del pezzetto di linea è dispari, allora è un accordo.
			// "currentString" contiene un accordo: lo salviamo e poi vediamo se ci sta col suo testo
			originalChord = currentString;
		}else{
			// Se l'indice del pezzetto di linea è pari, allora è testo.
			l.words = '';
			// Accodiamo alla stringa "finta" tutti i pezzetti di testo finchè non arriviamo alla lunghezza a cui andare a capo
			cleanline += currentString;
			if (
			  overflowIndex>0
			  &&
			  cleanline.length >= overflowIndex
			) {
				//da qui si va a capo:
				// cerchiamo esattamente dove
				//FlushRemaining = CheckStringOverflow(l,currentString);
				var currentIndex = currentString.length - (cleanline.length - overflowIndex);
				l.words = currentString.slice(0,currentIndex);
				l.flushed = currentString.slice(currentIndex);
				FlushRemaining = true;
			}else{
				// Se non andiamo a capo, allora accodo davvero il testo trovato
				l.words += currentString;
			}

			// Togliamo le parentesi quadre dall'accordo (se c'è)
			if (originalChord!='') {
				chord = FormatChords(originalChord.replace(/(\[|\])/g, ''));
				// se siamo all'ultimo pezzetto, se è vuoto e se abbiamo un accordo, allora
				// questo accordo è l'ultima cosa di questa riga, senza alcun testo dopo.
				// dobbiamo assicurarci che questo accordo sia visibile, cioè che "prenda spazio" (cosa che normalmente non è).
				var lastChord = ((index = array.length - 1) && l.words=='');

				// controlliamo che non ci siano due accordi attaccati: se ci sono, ci mettiamo dello spazio in mezzo
				if (l.lyrics.charAt(l.lyrics.length - 1)=='>') l.lyrics += '   ';
				l.lyrics += '<span class="chord' + (lastChord?' lastchord':'') + '" data-original-val="' + originalChord + '">' + chord + '</span>';
				// Tempo di pulizie
				originalChord = chord = '';
			}

			// Accodiamo il testo a quello già trovato
			//l.lyrics += l.words;
			l.lyrics += l.words.replace(/\s/g,'°');
		}
	}, this);	// Fine della funzione 

	// Quando arriviamo qui, abbiamo finito di esaminare e trattare testo e accordi, e ora possiamo
	// fare cose sul "risultato finale".

	// Metto puntini di sospensione al posto dell'ultimo spazio, se stiamo andando a capo
	if (FlushRemaining) {
		l.lyrics = l.lyrics.replace(/°$/,'');
		l.lyrics = l.lyrics.replace(/\s$/,'');
		l.lyrics += '&hellip;';
		LyricsOverflowed = true;
	}
	return;
}
//-----------------------------------------------------------------------------------------------------------------------------


//-----------------------------------------------------------------------------------------------------------------------------
// Esamina una singola riga, e sistema testo ed accordi
//-----------------------------------------------------------------------------------------------------------------------------
function parseSingleLine(line, linenum) {	// Prendiamo ogni singola linea della canzone e la esaminiamo

	if (line.match(/^#/)) return '';			// I commenti (le linee che iniziano con "#") le ignoriamo

	// Sezioni (titolo, strofa, ritornello, ecc):
	var matches = line.match(/^--(\w*)\:?\s*(.*)--/);
	if (matches!=null) {
		// Dobbiamo avere almeno due elementi nell'array: la stringa completa, e il testo tra i "--"
		if( matches.length >= 2 ) {
			parseSection(matches);
			return;
		}
	}

	const LyricsAndChords = {
		flushed: line,		// Stringa da esaminare; se andiamo a capo, qui c'è il resto della linea non ancora esaminato.
		lyrics:   '',		// Conterrà il testo
		chordspan_lyrics:   '',		// Conterrà il testo con gli accordi come span
		chords:   '',		// Conterrà gli accordi
		words:   ''			// Questa è qui solo perchè è comodo che le funzioni possano modificarla
	};
	var ACapo = '';

	do {
		LyricsAndChords.chords = LyricsAndChords.lyrics = LyricsAndChords.words = '';

		if (UsaSpanPerGliAccordi==false) {
			parseLyricsAndChords(LyricsAndChords);
			// METODO CON FONT MONOSPACED PER TESTO E ACCORDI
			if (LyricsAndChords.chords || LyricsAndChords.lyrics) {

				// Se la riga del testo è vuota, e stiamo facendo la intro, mettiamo gli accordi immediatamente dietro alla intro
				if (LyricsAndChords.lyrics=='' &&
				  (
				  currSection == 'intro'
				  ||
				  currSection == 'solo'
				  )
				) {
					buffer.push(LyricsAndChords.chords);
				}else{
					buffer.push(
					  //linenum +
					  '<span class="line">\n' +
					  ((LyricsOverflowed && LyricsAndChords.chords=='')?'':'<p class="chord' + ACapo + '">' +
					  //LyricsAndChords.chords.replace('#','&sharp;').replace('b','&flat;') +
					  FormatChords(LyricsAndChords.chords) +
					  '</p>\n') +
					  '<p class="lyrics ' + currSection + ACapo + '">' + LyricsAndChords.lyrics + '</p>\n' +
					  '</span>'
					);

					if (LyricsOverflowed && LyricsAndChords.flushed != '') {
						// Dobbiamo andare a capo:
						// Chiudiamo la sessione corrente, la prossima sarà "a capo"
						ACapo = ' acapo';
	/* -+-+
						if (buffer.length || sectionOpened ) buffer.push('</div> <!-- a capo -->\n');
						sectionOpened = false;	// Dopo dovremo aprirne una nuova
	*/
					}
				}
			}else{
				// Non abbiamo trovato niente ...?
				break;
			}
			songDiv.innerHTML = buffer.join("\n");
		}else{
			// METODO CON FONT A PIACERE E ACCORDI COME SPAN
			parseLyricsAndChordsSpan(LyricsAndChords);
			if (LyricsAndChords.lyrics ) {
				// Se la riga del testo è vuota, e stiamo facendo la intro, mettiamo gli accordi immediatamente dietro alla intro
				if (
				  currSection == 'intro'
				  ||
				  currSection == 'solo'
				) {
					buffer.push(LyricsAndChords.lyrics);
				}else{
					buffer.push(
					  //linenum +
					  '<div class="line chordspan">\n' +
					  '<p class="lyrics ' + currSection + ACapo + '">' + LyricsAndChords.lyrics + '</p>\n' +
					  '</div>'
					);
					// Dobbiamo andare a capo? lo segnamo
					if (LyricsOverflowed && LyricsAndChords.flushed != '') ACapo = ' acapo';
				}
			}else{
				// Non abbiamo trovato niente ...?
				break;
			}
			songDiv.innerHTML = buffer.join("\n");
		}
	} while (LyricsAndChords.flushed != '');

	if (LyricsOverflowed && sectionOpened) {
/*-+-+
		// Dobbiamo chiudere la riga "a capo"
		buffer.push('</div> <!-- fine a capo -->\n');
		sectionOpened = false;
*/
	}
	LyricsOverflowed = false;
	ACapo = '';

}
//-----------------------------------------------------------------------------------------------------------------------------



//-----------------------------------------------------------------------------------------------------------------------------
// Esamina l'intera canzone e la divide come specificato
//-----------------------------------------------------------------------------------------------------------------------------
function parseCompleteSong(CompleteSong) {
	buffer = [];
	if (!CompleteSong) CompleteSong = canzone_di_prova;

	if (!CompleteSong) return "";					// Non c'è nulla da fare, usciamo
	CompleteSong.split("\n").forEach(function(line, linenum) {	// Prendiamo ogni singola linea della canzone e la esaminiamo
		if (line.trim()!='') parseSingleLine(line, linenum);
	}, this);
	return buffer.join("\n");
}
//-----------------------------------------------------------------------------------------------------------------------------



//-----------------------------------------------------------------------------------------------------------------------------
function ImpostaMetronomo() {
	if (tempo_BPM==0 || tempo_Beats==0) return;
	var titolo = document.getElementById('title');
	if (!titolo) return;
	var titleHTML = titolo.innerHTML;
	//titleHTML = titleHTML+'\n<div class="JSmetronome" id="JSMetronome"><span id="MetronomeText">JS</span></div>\n';
	titleHTML = titleHTML+'\n<div class="JSmetronome" id="JSMetronome"><h1>M</h1></div>\n';
	titolo.innerHTML = titleHTML;

	Metronomo = document.getElementById('JSMetronome');
	if (!Metronomo) return;
//	TestoMetronomo = document.getElementById('MetronomeText');
//	if (!TestoMetronomo) return;

	//var tempo = (60/(tempo_BPM*tempo_Beats));
	var tempo = (60/tempo_BPM);
	console.log(tempo);
	CurrBeat += 1;
	//Metronomo.innerText = CurrBeat;
	Metronomo.innerHTML = '<h1>'+CurrBeat+'</h1>';

	var CSSRoot = document.querySelector(':root'); // Get the root element
	CSSRoot.style.setProperty('--bpm'  , tempo_BPM);
	CSSRoot.style.setProperty('--beats', tempo_Beats);
	CSSRoot.style.setProperty('--beat-duration',tempo +'s');

	Metronomo.addEventListener("animationend", MetronomoClick);
	Metronomo.addEventListener("animationiteration", MetronomoClick);

	Metronomo.style.animationPlayState = 'running';

}
//-----------------------------------------------------------------------------------------------------------------------------
function MetronomoClick() {
	if (
	  CurrBeat>=tempo_Beats
	||
	  CurrBeat<1
	) {
		//Metronomo.classList.replace('otherbeats','firstbeat');
		Metronomo.style.animationName = 'b1';
		CurrBeat = 1;
	}else{
		//Metronomo.classList.replace('firstbeat','otherbeats');
		Metronomo.style.animationName = 'b2';
		CurrBeat += 1;
	}
	//Metronomo.innerText = CurrBeat;
	Metronomo.innerHTML = '<h1>'+CurrBeat+'</h1>';
}
//-----------------------------------------------------------------------------------------------------------------------------
