let song, analyzer;
let ellipsoidSize = { width: 1600, height: 1600, depth: 1600 };
let targetEllipsoidSize = { width: 1600, height: 1600, depth: 1600 };
let easing = 0.01; // Decrease the easing value for slower transitions
let filteredAmplitude = 0.0;
let filterCoefficient = 0.2; // Adjust this value to control the smoothness of the filter

function preload() {
  song = loadSound('N217.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  song.loop();

  analyzer = new p5.Amplitude();
  analyzer.setInput(song);
}

function draw() {
  background(255);

  // Smoothly update the filtered amplitude
  let amplitude = analyzer.getLevel();
  filteredAmplitude += (amplitude - filteredAmplitude) * filterCoefficient;

  let targetSize = map(filteredAmplitude, 0, 1, 100, 800);
  targetSize = max(targetSize, 1600); // Set the minimum size to 1600

  if (random() < 0.001) {
    targetEllipsoidSize.width = random(max(targetSize * 0.5, 1600), targetSize * 1.5);
    targetEllipsoidSize.height = random(max(targetSize * 0.5, 1600), targetSize * 1.5);
    targetEllipsoidSize.depth = random(max(targetSize * 0.5, 1600), targetSize * 1.5);
  }

  ellipsoidSize.width += (targetEllipsoidSize.width - ellipsoidSize.width) * easing;
  ellipsoidSize.height += (targetEllipsoidSize.height - ellipsoidSize.height) * easing;
  ellipsoidSize.depth += (targetEllipsoidSize.depth - ellipsoidSize.depth) * easing;

  rotateY(frameCount * 0.001);
  rotateX(frameCount * 0.001);
  let scaleValue = map(filteredAmplitude, 0, 1, 0.1, 2);
  scale(scaleValue);

  stroke(0);
  strokeWeight(1);
  noFill();
  ellipsoid(ellipsoidSize.width, ellipsoidSize.height, ellipsoidSize.depth, 16);
}

function mousePressed() {
  if (song.isPlaying()) {
    song.stop();
    background(255, 0, 0);
  } else {
    song.play();
    background(0, 255, 0);
  }
}
