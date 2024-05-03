const canzone = `
--title: Testo di prova--
--intro--
[Ab] [Bb] [Cb] [Db] [Eb] [Fb] [Gb]

--Verse 1--
[A]La [B]Si [C]Do [D]Re [E]Mi [F]Fa [G]Sol
[La]La [Si]Si [Do]Do [Re]Re [Mi]Mi [Fa]Fa [Sol]Sol

[Em]Conto le stelle della bandiera americana   [Do]
Come la tua gonna, come la tua gomma

Si [G]muovono gli eserciti, qui c'è voglia di scappare
Per tro[Em]vare un po' di pace, dove bisogna andare?
[Bm]Mi ricordi l'alba vera,[C] mi ricordi l'alba vera

--Pre-Chorus 1--
Sa[Bm]rà un altro giorno pa[C]ssato nel letto
Con la bottiglia dell'[Am]acqua a fianco e il telefono stretto [Cm]

--Chorus 1--
E questo sole [G]da New York[Bm]
Mi sveglia nel matt[Em]ino, ma non sei qui vicino, [C]eh no

E vorrei dormire an[G]cora un po'[Bm]
Mentre volano le [Em]foglie di questo autunno
Che il vento poi le [Cm]porta fino a Saturno
O dove sei tu,[G] o dove sei [Bm]tu  [C]

--Bridge--
Il pro[Bm]fumo delle Wilson da tennis nuove
[C]Delle Superga al mare

--Chorus 3--
E questo sole [G]da New York[Bm]
Mi sveglia nel mat[Em]tino, ma non sei qui vicino, eh [C]no
E vorrei dormire an[G]cora un po'[Bm]
Mentre volano le [Em]foglie di questo autunno
Che il vento poi le [Cm]porta fino a Saturno
O dove sei tu[G], o dove sei tu[Em]
O dove sei [Bm]tu, [C] dove sei [G]tu
`;

// Esamine l'intera canzone e la divide come specificato
function parseChordPro(CompleteSong) {
	var buffer         = [];		// L'output HTML da mostrare sulla pagina
	var currSection    = "verse";	// Tipo di sezione in cui stiamo mettendo il testo
	var chordregex     = /\[([^\]]*)\]/;			// La ricerca di tutto quello compreso tra le parentesi quadre
	var sectionregex   = /^--(\w*)\:?\s*(.*)--/;	// La ricerca delle sezioni della canzone
	var inword         = /[a-z]$/;					//
	var last_was_lyric = false;						// True quando stiamo inserendo il testo,
													// falso quando stiamo inserendo divisioni (strofa, ritornello, ecc)

	if (!CompleteSong) return "";					// Non c'è nulla da fare, usciamo

	CompleteSong.split("\n").forEach(function(line, linenum) {	// Prendiamo ogni singola linea della canzone e la esaminiamo

		if (line.match(/^#/)) return "";			// I commenti (le linee che iniziano con "#") le ignoriamo

		// Sezioni (titolo, strofa, ritornello, ecc):
		var matches = line.match(/^--(\w*)\:?\s*(.*)--/);
		while (matches!=null) {	// loop finto, si esce sempre.
			// Dobbiamo avere almeno due elementi nell'array: la stringa completa, e il testo tra i "--"
			if( matches.length < 2 ) break;		// Usciamo da qui, e lasciamo che la gestisca il codice successivo.

buffer.push(matches);

			//ADD COMMAND PARSING HERE
			//reference: http://tenbyten.com/software/songsgen/help/HtmlHelp/files_reference.htm
			// implement basic formatted text sections
			var section = matches[1];
			var text    = ""
			var wrap    = "";
			var nextSection = "";
			if( matches.length >= 3 ) text = matches[2];

			//add more non-wrapping sections with this switch
			switch( section ) {
				case "titolo":
				case "title":
					section = "title";
					wrap = "h1";
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
					break;
				case "ponte":
				case "bridge":
					nextSection = "bridge";
					break;
				case "solo":
					nextSection = "solo";
					break;
				case "finale":
				case "ending":
					nextSection = "ending";
					break;
				case "note":
					nextSection = "note";
					break;
				// work from here to add wrapping sections

				default:
					// Cos'è 'sta roba?
					// Per non saper ne leggere ne scrivere ... la scrivo così come l'ho trovata.
					section = "comment";
					wrap    = "em";
					text    = matches[0];
					break;
			}	// Fine switch Sezione
			
			// Se dobbiamo creare un nuovo elemento, oppure abbiamo cambiato tipo di sezione:
			if( wrap || (nextSection && currSection!=nextSection) ) {
				// Se stavamo già facendo qualcosa, lo chiudiamo.
				if (buffer.length || last_was_lyric ) buffer.push('</div>');
				if (nextSection) {
					currSection = nextSection;
				}
				if (wrap) {
					// Apriamo la nuova sezione.
					buffer.push('<div class="section_block">');
					last_was_lyric = false;
					buffer.push('<' + wrap + ' class="' + section + '">' + text + '</' + wrap + '>' );
				}
			}
			break;
		}	// Fine del loop finto

		// Testo e/o accordi
		if (line.match(chordregex)) {
			// Se all'interno della linea troviamo le parentesi quadre, vuol dire che ci sono degli accordi.
			if( buffer.length || !last_was_lyric) {
				// Se abbiamo già qualcosa nel buffer, oppure prima stavamo facendo altro (non testo/accordi)
				// allora chiudiamo la sezione precedente
				buffer.push('</div>');
				// Apriamo una nuova sezione di "Testo/Accordi"
				buffer.push('<div class="lyric_block">');
				last_was_lyric = true;	// Stiamo facendo "Testi/Accordi"
			}

			var chords = "";
			var lyrics = "";
			var chordlen = 0;
			// Dividiamo la linea, "tagliano" ad ogni accordo
			line.split(chordregex).forEach(function(word, pos) {
				var dash = 0;
console.log(word + ", " + pos);
				// Testo
				if ((pos % 2) == 0) {
					lyrics = lyrics + word.replace(' ', "&nbsp;");

					 // Apply padding.  We never want two chords directly adjacent, so unconditionally add an extra space.
					if (word && word.length < chordlen) {
						chords = chords + "&nbsp;";
						lyrics = (dash == 1) ? lyrics + "-&nbsp;" : lyrics + "&nbsp&nbsp;";
						for (i = chordlen - word.length - dash; i != 0; i--) {
							lyrics = lyrics + "&nbsp;";
						}
					} else if (word && word.length == chordlen) {
						chords = chords + "&nbsp;";
						lyrics = (dash == 1) ? lyrics + "-" : lyrics + "&nbsp;";
					} else if (word && word.length > chordlen) {
						for (i = word.length - chordlen; i != 0; i--) {
							chords = chords + "&nbsp;";
						}
					}
				}
				// Accordi
				else {
					chord = word.replace(/[[]]/, "");
					chordlen = chord.length;
					chords = chords + '<span class="chord" data-original-val="' + chord + '">' + chord + '</span>';
				}
			}, this);	// Fine della funzione 
			buffer.push('<span class="line">' + chords + "<br/>\n" + lyrics + "</span>");
			return;
		}

		// Qualunque altra cosa
		buffer.push(line + "<br/>");
	}, this);
	return buffer.join("\n");
}
