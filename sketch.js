
let song, analyzer; // Audio objects
let ellipsoidSize = { width: 1600, height: 1600, depth: 1600 }; // Current ellipsoid size
let targetEllipsoidSize = { width: 1600, height: 1600, depth: 1600 }; // Target ellipsoid size
let easing = 0.001; // Easing value for smooth transitions
let filteredAmplitude = 0.0; // Filtered amplitude value
let filterCoefficient = 0.05; // for smoothness of the filter

function preload() {
  // Load the audio file
  song = loadSound('N217.mp3');
}

function setup() {

  // Enable anti-aliasing
  smooth();

  // Create the canvas
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // Loop the audio
  song.loop();

  // Create an amplitude analyzer and set the input to the song
  analyzer = new p5.Amplitude();
  analyzer.setInput(song);
}

function draw() {
  // Clear the background
  background(255);

  // Smoothly update the filtered amplitude
  let amplitude = analyzer.getLevel();
  filteredAmplitude += (amplitude - filteredAmplitude) * filterCoefficient;

  // Calculate the target size based on the filtered amplitude
  let targetSize = map(filteredAmplitude, 0, 1, 100, 800);
  targetSize = max(targetSize, 1600); // Set the minimum size to 1600

  // Randomly update the target ellipsoid size
  if (random() < 0.001) {
    targetEllipsoidSize.width = random(max(targetSize * 0.0, 1600), targetSize * 0.5);
    targetEllipsoidSize.height = random(max(targetSize * 0.0, 1600), targetSize * 0.5);
    targetEllipsoidSize.depth = random(max(targetSize * 0.0, 1600), targetSize * 0.5);
  }

  // Smoothly update the ellipsoid size
  ellipsoidSize.width += (targetEllipsoidSize.width - ellipsoidSize.width) * easing;
  ellipsoidSize.height += (targetEllipsoidSize.height - ellipsoidSize.height) * easing;
  ellipsoidSize.depth += (targetEllipsoidSize.depth - ellipsoidSize.depth) * easing;

  // Rotate the canvas based on frameCount
  rotateY(frameCount * 0.001);
  rotateX(frameCount * 0.001);

  // Scale the canvas based on the filtered amplitude
  let scaleValue = map(filteredAmplitude, 0, 1, 0.1, 2);
  scale(scaleValue);

  // Draw the ellipsoid
  stroke(0);
  strokeWeight(1);
  noFill();
  ellipsoid(ellipsoidSize.width, ellipsoidSize.height, ellipsoidSize.depth, 16);
}

function mousePressed() {
  // Toggle playback and change background color
  if (song.isPlaying()) {
    song.stop();
  } else {
    song.play();
  }
}
