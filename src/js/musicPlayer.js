function musicPlayer(soundobj, waitTime) {
  var thissound=document.getElementById(soundobj);
	window.setTimeout( function(){ 
		console.log("PLAY");
	  thissound.play();
	}, waitTime * 1000);
}
