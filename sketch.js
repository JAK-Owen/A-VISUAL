let song, analyzer;
let audio, fft;
let sphereSize = 100;

function preload() {
  song = loadSound('N217.mp3');
}

function setup() {
  createCanvas(1600, 1600, WEBGL); // Set up a WebGL canvas for 3D rendering
  song.loop();

  // Amplitude analyzer
  analyzer = new p5.Amplitude();

  // Connects input to a volume analyzer
  analyzer.setInput(song);

  // Audio input and FFT
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

  // Apply easing to smooth out size changes
  let targetSize = 100 + volumeInput * min(windowWidth, windowHeight);
  let easing = 0.05;
  sphereSize += (targetSize - sphereSize) * easing;

  rotateY(frameCount * 0.001); // Rotate the sphere
  rotateX(frameCount * 0.001); // Rotate the sphere
  sphere(sphereSize);

  let spectrum = fft.analyze();

  beginShape();
  for (let i = 0; i < spectrum.length; i++) {
    vertex(i, map(spectrum[i], 0, 255, height, 0));
  }
  endShape();
}

// Play Button
function mousePressed() {
  if (song.isPlaying()) {
    song.stop();
    background(255, 0, 0);
  } else {
    song.play();
    background(0, 255, 0);
  }
}
