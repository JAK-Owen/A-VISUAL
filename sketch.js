let song, analyzer;
let audio, fft;

function preload() {
  song = loadSound('N217.mp3');
}

function setup() {
  createCanvas(1600, 1600);
  song.loop();

  // Amplitude analyzer
  analyzer = new p5.Amplitude();

  // Connects input to an volume analyzer
  analyzer.setInput(song);

  //for audio
  audio = new p5.AudioIn();
  audio.start();
  fft = new p5.FFT();
  fft.setInput(audio);
}



function draw() {
  background(255);

  // Get the average amplitude
  let volumeInput = analyzer.getLevel();
  stroke(0);

  // Draw shape with size based on volume
  circle(width / 2, height / 2, 100 + volumeInput * windowWidth, 100 + volumeInput * windowHeight);


  let spectrum = fft.analyze();

  beginShape();
  for (i = 0; i < spectrum.length; i++) {
    vertex(i, map(spectrum[i], 0, 455, height, 0));
  }
  endShape();
}



// Play Button
function mousePressed() {
  if (song.isPlaying()) {
    // .isPlaying() returns a boolean
    song.stop();
    background(255, 0, 0);
  } else {
    song.play();
    background(0, 255, 0);
  }
}