var mySong = Songs[0];

	var run_game = false;
        var FRAME_RATE = 60;
        var INIT_X = 100;
        var VERT_SPACING;
        var BEAT_LENGTH_SIZE = 120;
        var NUM_NOTES = 24;
        var NUM_OCTAVES = 2;
        var NOTE_TOL = 50;
	var DEFAULT_COLOR = "#F5B800";
	var DO_IT_COLOR = "#F00";
	var BINGO_COLOR = "#0F0";

        var canvas, width, height;
      	var notes;
        var stage;
      	var userPitchLine;
      	var userPitchCircle;
      	var lineX;
      	var userPitch;
      	var userPitchWasUndefined;
	var rects;
  var maxOctave;
        var markerX;
	var highlighted;
	var moveSpeed;
	var audio_start;
	var score_container = document.getElementById("score");
	var curColor; 

        // 12 * (Math.log(frequency / 440) / Math.log(2) ) // + 69

        function init() {
			      mySong = Songs[window.songId];
            canvas = document.getElementById('note-cont');
            width = canvas.width;
            height = canvas.height;
	          userPitchLine = new createjs.Shape();
            userPitchLine.graphics.setStrokeStyle(1).beginStroke("black").moveTo(100,100);
	          userPitchCircle = new createjs.Shape();
    	      userPitchCircle.graphics.beginStroke("red").drawCircle(0, 0, 40);
	          userPitchCircle.x = markerX;
	          moveSpeed = (mySong.bpm / 60) * (BEAT_LENGTH_SIZE / FRAME_RATE);
            markerX = 1/4*width;
	          userPitchCircle.x = markerX;
	          userPitchCircle.y = 100;
	          audio_start = (((canvas.width - markerX) / moveSpeed) / 60) - mySong.startTime;
	          toggleLiveInput();
		
            VERT_SPACING = height / NUM_NOTES;
            stage = new createjs.Stage(canvas);
            createjs.Ticker.setFPS(FRAME_RATE);

            var curTimeMarker = new createjs.Shape();
            lineX = markerX;
            var g = curTimeMarker.graphics;
            g.beginFill("#FFF");
            g.drawRect(markerX, 0, 1, height);
            g.endFill();
            stage.addChild(curTimeMarker);

            rects = new Array();
            maxOctave = 0;
            var beat = 0;
            var min = 0;
            var negative = false;
	          curColor = Array(mySong.notes.length);
            for (var i = 0; i < mySong.notes.length; i++) {
            	note = mySong.notes[i];
              if (note[2] > maxOctave) {
                maxOctave = note[2];
              }
              var noteLength = note[1];
              var y = getYCoordFromNote(note[0], note[2]); // pitch
              if (y < min) {
                negative = true;
                min = y;
              }
              var x = getXCoordFromBeat(beat);
              var width = noteLength * BEAT_LENGTH_SIZE - 2;
              var height = NOTE_TOL;
              rects.push(new createjs.Rectangle(0, y + (NOTE_TOL/2), width, height));
              console.log(y);
              console.log("BUH");
              console.log(note[0] + note[2])
	            rects[i].mahX = x;
              beat += noteLength; // offset next note starting beat
	            curColor[i] = DEFAULT_COLOR;
            }
            //console.log(rects);
            if (negative) {
              for (var i = 0; i < rects.length; i++) {
                rects[i].y -= min;
              }
            }

            notes = [];
            for (var i = 0; i < rects.length; i++) {
              var s = drawRectangle(rects[i], DEFAULT_COLOR);
	          notes.push(s);
	          notes[i].x = rects[i].mahX;
            stage.addChild(s);
            }

              stage.addChild(userPitchLine);
              stage.addChild(userPitchCircle);
      		stage.update();
      		createjs.Ticker.addListener(window);
           
		setInterval(function() { 
			score_container.innerHTML = "" + score + " Combo: " + score_multipler + "x";
		}, 1000);
        }

	var score = 0;
	  var score_break = 0;
	  var score_combo = 0;
	  var score_multipler = 1;
	var curColor = DEFAULT_COLOR;
      	function tick() {
		if(run_game) { 
			var userNote = noteStrings[noteFromPitch(userPitch) % 12];
			var y_val = canvas.height - (userPitch / 4);
				y_val = 1.51 * 12 * (Math.log(y_val / 440) / Math.log(2) ) * VERT_SPACING + 190; // twinkle
        // y_val = 2.9 * 12 * (Math.log(y_val / 440) / Math.log(2) ) * VERT_SPACING + 250; // kill bill
			if( !isNaN(y_val) ) {
				userPitchCircle.y = y_val;
			}
			for(var i = 0; i < notes.length; i++) {
				notes[i].x -= moveSpeed;
				var intersectingLine = (markerX > notes[i].x && markerX < (notes[i].x + rects[i].width));
				var intune = (y_val > rects[i].y && y_val < (rects[i].y + rects[i].height));
				var newColor = DEFAULT_COLOR;
				if( intersectingLine ) {
					var ydiff =  Math.abs( y_val - (rects[i].y + (rects[i].height/2)) );
					if( !isNaN(ydiff) ) {
						userPitchCircle.graphics.clear().beginStroke("black").drawCircle(0, 0, 40);
					}
					// console.log(ydiff);
					newColor = DO_IT_COLOR;
					if( intune ) {
				    score_break = 0;
				    score_combo += 1;
				    if (score_combo > 15) {
				      score_multipler *= 2;
				      score_combo = 0;
			    }
						score += 1 * score_multipler;
						newColor = BINGO_COLOR;
					} else {
            score_break += 1;
            if (score_break > 3) {
              score_break = 0;
              score_combo = 0;
              score_multipler = 1;
            }
          }
				}
				if( newColor != curColor[i] ){
					notes[i].graphics.clear().beginStroke("#000").beginFill(newColor).drawRect(rects[i].x, rects[i].y, rects[i].width, rects[i].height).endFill();
					curColor[i] = newColor;
				}

			}
			userPitchLine.x -= moveSpeed;
			lineX += moveSpeed;
			if(userPitch !== undefined){
				if( !isNaN(y_val) ) {
					userPitchLine.graphics.lineTo(lineX, y_val);
				}
				//console.log( noteStrings[noteFromPitch(userPitch) % 12] );
			} else {
				// userPitchLine.graphics.moveTo(lineX, canvas.height);
				userPitchWasUndefined = true;
			}
		}
      		stage.update();
      	}

        function getXCoordFromBeat(beat) {
          var HORIZ_OFFSET = canvas.width;
          return beat * BEAT_LENGTH_SIZE + HORIZ_OFFSET;
        }

        function getYCoordFromNote(note, octave){
          var pos;
          //console.log(height);
          if (note == "C" || note == "B#") {
            pos = 11;
          } else if (note == "C#" || note == "Db") {
            pos = 10;
          } else if (note == "D") {
            pos = 9;
          } else if (note == "D#" || note == "Eb") {
            pos = 8;
          } else if (note == "E" || note == "Fb") {
            pos = 7;
          } else if (note == "F" || note == "E#") {
            pos = 6;
          } else if (note == "F#" || note == "Gb") {
            pos = 5;
          } else if (note == "G") {
            pos = 4;
          } else if (note == "G#" || note == "Ab") {
            pos = 3;
          } else if (note == "A") {
            pos = 1.1;
          } else if (note == "A#" || note == "Bb") {
            pos = 1;
          }  else if (note == "B" || note == "Cb") {
            pos = 0;
          } else {
            console.log("Invalid note");
            return null;
          }

          return pos * VERT_SPACING + ((NUM_OCTAVES-1) - (octave + 1)) * (11 * VERT_SPACING);
        }

        function drawRectangle(rect, color) {
	    var s = new createjs.Shape();
            var g = s.graphics;

            g.beginStroke("#000");
            g.beginFill(color);
            g.drawRect(rect.x, rect.y, rect.width, rect.height);
            g.endFill();

            return s;
	}
