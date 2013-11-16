function judgeFrequency(song, currentBeat, userFrequency, freqTolerance) {
	var goalFreq;
	var beat = 0;
	for(var i = 0; i < song.notes.length; i++){
		beat += song.notes[i][1];
		if(beat >= currentBeat) {
			goalFreq = song.notes[i][0];
			break;
		}
	}	
	var freqDiff = Math.abs( userFrequency - goalFreq );
	return freqDiff < freqTolerance;
}
