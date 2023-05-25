let song, analyzer;
let shapeSize = { width: 1600, height: 1600, depth: 1600 };
let targetshapeSize = { width: 1600, height: 1600, depth: 1600 };
let easing = 0.0001;
let filteredAmplitude = 0.0;
let filterCoefficient = 0.02;

let currentShapeIndex = 0;
let targetShapeIndex = 0;
let shapes = ["box", "sphere", "cylinder", "cone", "ellipsoid", "torus"];

let shapeTimer = 0;
let shapeDuration = 300;

function preload() {
  song = loadSound('N217.mp3');
}

function setup() {
  smooth();
  createCanvas(windowWidth, windowHeight, WEBGL);
  song.loop();
  analyzer = new p5.Amplitude();
  analyzer.setInput(song);
}

function draw() {
  background(0);

  let amplitude = analyzer.getLevel();
  filteredAmplitude += (amplitude - filteredAmplitude) * filterCoefficient;

  let targetSize = map(filteredAmplitude, 0, 1, 100, 800);
  targetSize = max(targetSize, 1600);

  if (random() < 0.001) {
    targetshapeSize.width = random(max(targetSize * 0.0, 1600), targetSize * 0.5);
    targetshapeSize.height = random(max(targetSize * 0.0, 1600), targetSize * 0.5);
    targetshapeSize.depth = random(max(targetSize * 0.0, 1600), targetSize * 0.5);

    targetShapeIndex = floor(random(shapes.length));

    shapeTimer = 0; // Reset the shape timer
  }

  shapeSize.width += (targetshapeSize.width - shapeSize.width) * easing;
  shapeSize.height += (targetshapeSize.height - shapeSize.height) * easing;
  shapeSize.depth += (targetshapeSize.depth - shapeSize.depth) * easing;

  let morphedShape = morphShape(currentShapeIndex, targetShapeIndex, easing);

  rotateY(frameCount * 0.001);
  rotateX(frameCount * 0.001);

  let scaleValue = map(filteredAmplitude, 0, 1, 0.1, 2);
  scale(scaleValue);

  stroke(255);
  strokeWeight(1);
  noFill();
  ambientMaterial(255);
  specularMaterial(255);

  // Draw the current shape
  drawShape(currentShapeIndex);

  // Increment the shape timer
  shapeTimer++;

  // If the shape timer exceeds the duration, update the current shape
  if (shapeTimer >= shapeDuration) {
    currentShapeIndex = targetShapeIndex;
  }

  // Interpolate the shape towards the target shape
  if (currentShapeIndex !== targetShapeIndex) {
    let interpolation = shapeTimer / shapeDuration;
    let intermediateShape = morphShape(currentShapeIndex, targetShapeIndex, interpolation);
    if (intermediateShape !== currentShapeIndex) {
      push();
      let remainingTime = shapeDuration - shapeTimer;
      let remainingProgress = remainingTime / shapeDuration;
      let scaleFactor = map(remainingProgress, 0, 1, 0, 1);
      scale(scaleFactor);
      drawShape(intermediateShape);
      pop();
    }
  }
}

function morphShape(startIndex, endIndex, amount) {
  let morphedIndex = startIndex;

  if (startIndex !== endIndex) {
    morphedIndex = lerp(startIndex, endIndex, amount);

    if (morphedIndex >= shapes.length) {
      morphedIndex -= shapes.length;
    }
  }

  return morphedIndex;
}

function drawShape(index) {
  switch (shapes[index]) {
    case "box":
      box(shapeSize.width, shapeSize.height, shapeSize.depth);
      break;
    case "sphere":
      sphere(max(shapeSize.width, shapeSize.height, shapeSize.depth) / 2);
      break;
    case "cylinder":
      cylinder(shapeSize.width / 2, shapeSize.height);
      break;
    case "cone":
      cone(shapeSize.width / 2, shapeSize.height);
      break;
    case "ellipsoid":
      ellipsoid(shapeSize.width / 2, shapeSize.height / 2, shapeSize.depth / 2);
      break;
    case "torus":
      torus(shapeSize.width / 2, shapeSize.height / 2);
      break;
  }
}

function mousePressed() {
  if (song.isPlaying()) {
    song.stop();
  } else {
    song.play();
  }
}
