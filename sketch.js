// Declare variables and objects
let song, analyzer;
let shapeSize = { width: 1600, height: 1600, depth: 1600 };
let targetShapeSize = { width: 1600, height: 1600, depth: 1600 };
let easing = 0.02;
let filteredAmplitude = 0.0;
let filterCoefficient = 0.02;

let currentShapeIndex = 0;
let targetShapeIndex = 0;
let shapes = ["box"];

let shapeTimer = 0;
let shapeDuration = 300;

let interpolationFactor = 0.0;

let noiseOffset = 0.0;
let noiseIncrement = 0.0001;

let maxSubdivisions = 0;
let subdivisionFactor = 0.9;

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
  background(0);

  let amplitude = analyzer.getLevel();
  filteredAmplitude += (amplitude - filteredAmplitude) * filterCoefficient;

  let targetSize = map(filteredAmplitude, 0, 1, 100, 800);
  targetSize = max(targetSize, 1600);

  if (random() < 0.001) {
    targetShapeSize.width = random(max(targetSize * 0.0, 1600), targetSize * 0.5);
    targetShapeSize.height = random(max(targetSize * 0.0, 1600), targetSize * 0.5);
    targetShapeSize.depth = random(max(targetSize * 0.0, 1600), targetSize * 0.5);

    targetShapeIndex = floor(random(shapes.length));

    shapeTimer = 0;
  }

  shapeSize.width += (targetShapeSize.width - shapeSize.width) * easing;
  shapeSize.height += (targetShapeSize.height - shapeSize.height) * easing;
  shapeSize.depth += (targetShapeSize.depth - shapeSize.depth) * easing;

  let morphedShapeIndex = lerp(currentShapeIndex, targetShapeIndex, interpolationFactor);
  let morphedShapeSize = {
    width: lerp(shapeSize.width, targetShapeSize.width, interpolationFactor),
    height: lerp(shapeSize.height, targetShapeSize.height, interpolationFactor),
    depth: lerp(shapeSize.depth, targetShapeSize.depth, interpolationFactor)
  };

  rotateY(frameCount * 0.001);
  rotateX(frameCount * 0.001);

  let scaleValue = map(filteredAmplitude, 0, 1, 0.1, 2);
  scale(scaleValue);

  let noiseValue = noise(noiseOffset);
  let rotationAngle = map(noiseValue, 0, 1, -PI, PI);
  rotateZ(rotationAngle);

  stroke(255);
  strokeWeight(1);
  noFill();
  ambientMaterial(255);
  specularMaterial(255);

  maxSubdivisions = floor(map(filteredAmplitude, 0, 1, 0, 5)); // Calculate the maximum subdivisions based on the filtered amplitude

  drawFractalShape(morphedShapeIndex, morphedShapeSize, maxSubdivisions);

  shapeTimer++;

  if (shapeTimer >= shapeDuration) {
    currentShapeIndex = targetShapeIndex;
    interpolationFactor = 0.0;
  }

  if (currentShapeIndex !== targetShapeIndex && interpolationFactor < 1.0) {
    interpolationFactor += 0.01;
  }

  noiseOffset += noiseIncrement;
}

function drawFractalShape(index, size, subdivisions) {
  if (subdivisions <= 0) {
    drawShape(index, size);
  } else {
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
      drawFractalShape(index, subSize, subdivisions - 1);
      pop();
    }
  }
}

function drawShape(index, size) {
  switch (shapes[index]) {
    case "box":
      box(size.width, size.height, size.depth);
      break;
    case "sphere":
      sphere(max(size.width, size.height, size.depth) / 2);
      break;
    case "cylinder":
      cylinder(size.width / 2, size.height);
      break;
    case "cone":
      cone(size.width / 2, size.height);
      break;
    case "ellipsoid":
      ellipsoid(size.width / 2, size.height / 2, size.depth / 2);
      break;
    case "torus":
      torus(size.width / 2, size.height / 2);
      break;
  }
}

function mouseClicked() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.play();
  }
}
