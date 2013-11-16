var mySong = Songs[0];

window.tolerance = 16200;
var run_game = false;
var FRAME_RATE = 60;
var INIT_X = 100;
var VERT_SPACING;
var BEAT_LENGTH_SIZE = 120;
var NUM_NOTES = 12;
var NUM_OCTAVES = 2;
var NOTE_TOL = 50;
var DEFAULT_COLOR = "#F5B800";
var DO_IT_COLOR = "#EE0";
var MISS_COLOR = "#F00";
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
var noteScores;

// 12 * (Math.log(frequency / 440) / Math.log(2) ) // + 69

function init() {
  mySong = Songs[window.songId];
  canvas = document.getElementById('note-cont');
  width = canvas.width;
  height = canvas.height;
  userPitchLine = new createjs.Shape();
  userPitchLine.graphics.setStrokeStyle(1).beginStroke("black").moveTo(100, 100);
  userPitchCircle = new createjs.Shape();
  userPitchCircle.graphics.beginStroke("red").drawCircle(0, 0, 40);
  userPitchCircle.x = markerX;
  moveSpeed = (mySong.bpm / 60) * (BEAT_LENGTH_SIZE / FRAME_RATE);
  markerX = 1 / 4 * width;
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
  noteScores = Array(mySong.notes.length);
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
    if( !note[3] ) {
      // is not held
      width = 15;
    }
    var height = NOTE_TOL;
    rects.push(new createjs.Rectangle(0, y + (NOTE_TOL / 2), width, height));
    rects[i].mahX = x;
    beat += noteLength; // offset next note starting beat
    curColor[i] = DEFAULT_COLOR;
    noteScores[i] = { "score": 0, "possible": 0 };
  }
  //console.log(rects);
  if (negative) {
    for (var i = 0; i < rects.length; i++) {
      rects[i].y -= min;
    }
  }

  NUM_NOTES *= maxOctave + 1;
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

  setInterval(function () {
    score_container.innerHTML = "" + score + " Combo: " + score_multipler + "x";
  }, 1000);
}

var score = 0;
var score_break = 0;
var score_combo = 0;
var score_multipler = 1;

function tick() {
  if (run_game) {
    var userNote = noteStrings[noteFromPitch(userPitch) % 12];
    var y_val = canvas.height - (userPitch / 4);
    //y_val = 12 * (Math.log(y_val / 440) / Math.log(2) ) * VERT_SPACING + 69;
    // y_val = 12 * (Math.log(y_val / 440) / Math.log(2)) * VERT_SPACING + 600;
    y_val = 1.75 * 12 * (Math.log(y_val / 440) / Math.log(2) ) * VERT_SPACING + 140; // twinkle
    if (!isNaN(y_val)) {
      userPitchCircle.y = y_val;
    }
    for (var i = 0; i < notes.length; i++) {
      notes[i].x -= moveSpeed;
      var pastLine = (notes[i].x + rects[i].width) <= markerX;
      var intersectingLine = (notes[i].x < markerX && markerX < (notes[i].x + rects[i].width));
      var intune = (y_val > rects[i].y && y_val < (rects[i].y + rects[i].height));
      var newColor = DEFAULT_COLOR;
      if (intersectingLine) {
        //console.log(notes[i].x > markerX);
        var ydiff = Math.abs(y_val - (rects[i].y + (rects[i].height / 2)));
        if (!isNaN(ydiff)) {
          var col = (parseInt("FF0000", 16) + ydiff).toString(16).substr(0, 6);
          // console.log(col);
          userPitchCircle.graphics.clear().beginStroke("#" + col).drawCircle(0, 0, 40);
        }
        newColor = DO_IT_COLOR;
        if (intune) {
          // score_break = 0;
          // score_combo += 1;
          // if (score_combo > 15) {
          //   score_multipler *= 2;
          //   score_combo = 0;
          // }
          // score += 1 * score_multipler;
          noteScores[i].score += 1;
          newColor = BINGO_COLOR;
        } else {
          // score_break += 1;
          // if (score_break > 3) {
          //   score_break = 0;
          //   score_combo = 0;
          //   score_multipler = 1;
          // }
        }
        noteScores[i].possible += 1;
      }
      if (pastLine) {
        if(noteScores[i].label === undefined) {
          var s = "Miss";
          if(!mySong.notes[i][3]){
            if(noteScores[i].score > 0){
              notes[i].correct = true;
              s = "Good!";
              score += 5;
            }
          } else {
            var frac = noteScores[i].score / noteScores[i].possible;
            if( frac > 0.5 ) {
              s = "Excellent"; score += 12;
              notes[i].correct = true;
            } else if( frac > 0.2 ) {
              s = "Good";
              score += 8;
              notes[i].correct = true;
            } else if(frac > 0.1){
              s = "Okay";
              score += 3;
              notes[i].correct = true;
            } else if ( noteScores[i].score > 0) {
              s = "Bad";
              score += 1;
            }
          }
          var label = new createjs.Text(s, "20px Arial", "black");
          label.textAlign = "center";
          label.x = notes[i].x + (rects[i].width / 2);
          label.y = 100;
          label.maxWidth = 40;
          noteScores[i].label = label;
          stage.addChild(label);
        } else {
          noteScores[i].label.x -= moveSpeed;
          if(notes[i].correct) {
            newColor = BINGO_COLOR;

          } else {
            newColor = MISS_COLOR;
          }
        }
      }
      if (newColor != curColor[i]) {
        notes[i].graphics.clear().beginStroke("#000").beginFill(newColor).drawRect(rects[i].x, rects[i].y, rects[i].width, rects[i].height).endFill();
        curColor[i] = newColor;
      }

    }
    userPitchLine.x -= moveSpeed;
    lineX += moveSpeed;
    if (userPitch !== undefined) {
      if (!isNaN(y_val)) {
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
            newColor = MISS_COLOR;
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