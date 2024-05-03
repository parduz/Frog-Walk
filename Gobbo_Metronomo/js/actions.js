/**
Actions Processor...
https://stackoverflow.com/questions/62857052/move-selected-element-with-arrow-keys-in-javascript
**/
let boosted = 20;
let normal = 10;
//const songDiv = document.getElementById('song');

function initializeActions() {

	songDiv.style.left="0px";	// Serve per muoverlo coi tasti
	//var CSSRoot = document.querySelector(':root'); // Get the root element
	//movewidth = CSSRoot.style.getProperty('--padding-margin-w');

	// attach the keydown event listeners
	window.addEventListener("keydown", function(e){
		processKeys(e);
	});

	/*
	document.addEventListener("keydown", function(e) {
	  square.classList.add('shake-square')
	})
	*/
	songDiv.addEventListener("animationend", function(e) {
		console.log("AnimationEnd");
		songDiv.classList.remove('pageAnimation')
	});
}

function processKeys(e){	
	var key_code = e.which || e.keyCode;
	let speed = e.shiftKey ?	boosted : normal;
	switch(key_code){
		case 35:	// Fine
			break;
		case 36:	// Home
			goHome(songDiv);
			break;
		case 37: //left arrow key
		case 33:	// PageUp
			moveRight(songDiv, movewidth);
			break;
		case 39: //right arrow key
		case 34:	// PageDown
			moveLeft(songDiv, movewidth);
			break;
		case 38: //Up arrow key
			//selections.forEach(function(t){ moveUp(t, speed); });
			break;
		case 40: //down arrow key
			//selections.forEach(function(t){ moveDown(t, speed);});
			break;

		case 96:	// Numpad 0
			songDiv.classList.remove("debugclass-1");
			songDiv.classList.remove("debugclass-2");
			songDiv.classList.remove("debugclass-3");
			break;
		case 97:	// Numpad 1
			songDiv.classList.add("debugclass-1");
			break;
		case 98:	// Numpad 2
			songDiv.classList.add("debugclass-1");
			songDiv.classList.add("debugclass-2");
			break;
		case 99:	// Numpad 3
			songDiv.classList.add("debugclass-1");
			songDiv.classList.add("debugclass-3");
			break;

		case 107:	// Numpad +
			var bodyStyles = window.getComputedStyle(document.body);
			var charsize = parseFloat(bodyStyles.getPropertyValue('--normal-text-size') ); //get
			document.body.style.setProperty('--normal-text-size', ((charsize+0.2) + 'vh') );//set
			break;
		case 109:	// Numpad -
			var bodyStyles = window.getComputedStyle(document.body);
			var charsize = parseFloat(bodyStyles.getPropertyValue('--normal-text-size') ); //get
			document.body.style.setProperty('--normal-text-size', ((charsize-0.2) + 'vh') );//set
			break;
		case 106:	// Numpad *
			UsaSpanPerGliAccordi = !UsaSpanPerGliAccordi;
			getSizes();
			break;
		default:
			console.log("Unknown keyCode " + e.keyCode);
	}
}
function goHome(t){
	let ll = parseInt(t.style.left);
	if (ll!=0) t.style.left = "0px";
	else {

	}
}

function moveLeft(t, speed = 5){
	//t.style.left = parseInt(t.style.left) - speed + "px";
	let ll = parseFloat(t.style.left) - speed;
	//if (ll<0) ll = 0;
	t.style.left = ll + "px";
	console.log(t.left + " - " + t.width + " - " + t.innerWidth + " - " + t.scrollWidth);
}

function moveUp(t, speed = 5){
	t.style.top = parseInt(t.style.top) - speed +"px";
}

function moveRight(t, speed = 5){
	//t.style.left = parseInt(t.style.left) + speed + "px";
	let ll = parseFloat(t.style.left) + speed;
	if (ll>0) ll = 0;
	t.style.left = ll + "px";
}

function moveDown(t, speed = 5){
	t.style.top = parseInt(t.style.top) + speed +"px";
}
