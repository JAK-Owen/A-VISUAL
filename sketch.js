// Declare variables and objects
let song, analyzer, fft;
let shapeSize = { width: 400, height: 400, depth: 400 };
let targetShapeSize = { width: 400, height: 400, depth: 400 };
let easing = 0.01; // Adjust the easing coefficient for smoother transitions
let filteredAmplitude = 0.0;
let filterCoefficient = 0.1;
let shapeTimer = 0;
let shapeDuration = 1000;
let noiseOffset = 0.0;
let noiseIncrement = 0.00005;
let minAmplitude = 0.01;
let maxAmplitude = 1.0;
let minSubdivisions = 0;
let maxSubdivisions = 3;
let subdivisionFactor = 0.5; // Adjust the maximum scale for a less jumpy appearance
let minThickness = 0.5;
let maxThickness = 5;

function preload() {
  song = loadSound('N217.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  song.loop();
  analyzer = new p5.Amplitude();
  analyzer.setInput(song);
  fft = new p5.FFT();
  fft.setInput(song);
}

function draw() {
  background(0);

  let amplitude = analyzer.getLevel();
  filteredAmplitude += (amplitude - filteredAmplitude) * filterCoefficient;

  let spectrum = fft.analyze();
  let lowFreqRange = fft.getEnergy("bass", "mid");
  let highFreqRange = fft.getEnergy("mid", "treble");

  let targetSize = map(filteredAmplitude, 0, 1, 100, 600); // Reduce the maximum target size
  targetSize = max(targetSize, 400);

  if (shapeTimer >= shapeDuration) {
    targetShapeSize.width = random(max(targetSize * 0.5, 400), targetSize * 0.6);
    targetShapeSize.height = random(max(targetSize * 0.5, 400), targetSize * 0.6);
    targetShapeSize.depth = random(max(targetSize * 0.5, 400), targetSize * 0.6);

    shapeTimer = 0;
  } else {
    shapeTimer++;
  }

  shapeSize.width += (targetShapeSize.width - shapeSize.width) * easing;
  shapeSize.height += (targetShapeSize.height - shapeSize.height) * easing;
  shapeSize.depth += (targetShapeSize.depth - shapeSize.depth) * easing;

  rotateY(frameCount * 0.001);
  rotateX(frameCount * 0.001);

  let scaleValue = map(filteredAmplitude, 0, 1, 0.1, 1); // Reduce the maximum scale value
  scale(scaleValue);

  let noiseValue = noise(noiseOffset);
  let rotationAngle = map(noiseValue, 0, 1, -PI, PI) * 0.5;
  rotateZ(rotationAngle);

  stroke(255);
  noFill();
  ambientMaterial(255);
  specularMaterial(255);

  let subdivisions = floor(map(lowFreqRange, 0, 255, minSubdivisions, maxSubdivisions));

  let thickness = map(highFreqRange, 0, 255, minThickness, maxThickness);
  strokeWeight(thickness);

  drawFractalShape(shapeSize, subdivisions);

  noiseOffset += noiseIncrement;
}

function drawFractalShape(size, subdivisions) {
  if (subdivisions <= 0) {
    box(size.width, size.height, size.depth);
  } else {
    let amplitudeFactor = map(filteredAmplitude, minAmplitude, maxAmplitude, 0.5, 1.5);

    if (filteredAmplitude < 0.2) {
      let sensitivityFactor = map(filteredAmplitude, minAmplitude, 0.2, 0.1, 1);
      amplitudeFactor *= sensitivityFactor;
    }

    for (let i = 0; i < 8; i++) {
      let x = size.width * (i % 2 === 0 ? subdivisionFactor : -subdivisionFactor);
      let y = size.height * (i % 4 < 2 ? subdivisionFactor : -subdivisionFactor);
      let z = size.depth * (i < 4 ? subdivisionFactor : -subdivisionFactor);

      let subSize = {
        width: size.width * subdivisionFactor,
        height: size.height * subdivisionFactor,
        depth: size.depth * subdivisionFactor
      };

      push();
      translate(x, y, z);
      drawFractalShape(subSize, subdivisions - 1);
      pop();
    }

    subdivisionFactor = amplitudeFactor;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function touchStarted() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.play();
  }
}
