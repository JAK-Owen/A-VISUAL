// Declare variables and objects
let song, analyzer; // Variables for the song and audio analyzer
let shapeSize = { width: 1600, height: 1600, depth: 1600 }; // Initial size of the shape
let targetShapeSize = { width: 1600, height: 1600, depth: 1600 }; // Target size of the shape
let easing = 0.02; // Easing factor for smooth transitions
let filteredAmplitude = 0.0; // Filtered amplitude of the audio
let filterCoefficient = 0.02; // Coefficient for filtering the amplitude

let shapeTimer = 0; // Timer for changing the shape
let shapeDuration = 300; // Duration between shape changes

let noiseOffset = 0.0; // Offset for Perlin noise
let noiseIncrement = 0.0001; // Increment value for Perlin noise

let minAmplitude = 0.02; // Minimum amplitude threshold
let maxAmplitude = 1.0; // Maximum amplitude threshold
let minSubdivisions = 0; // Minimum number of subdivisions
let maxSubdivisions = 5; // Maximum number of subdivisions
let subdivisionFactor = 0.95; // Factor for reducing size in each subdivision

function preload() {
  song = loadSound('N217.mp3'); // Preload the audio file
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL); // Create a WebGL canvas
  song.loop(); // Loop the audio
  analyzer = new p5.Amplitude(); // Create an amplitude analyzer
  analyzer.setInput(song); // Set the input source for the analyzer
}

function draw() {
  background(0); // Clear the background

  let amplitude = analyzer.getLevel(); // Get the current audio level
  filteredAmplitude += (amplitude - filteredAmplitude) * filterCoefficient; // Smoothly filter the amplitude

  let targetSize = map(filteredAmplitude, 0, 1, 100, 800); // Map the filtered amplitude to a target size
  targetSize = max(targetSize, 1600); // Ensure the target size is at least the initial size

  // Change the target shape size randomly after a certain duration
  if (random() < 0.001) {
    targetShapeSize.width = random(max(targetSize * 0.0, 1600), targetSize * 0.5);
    targetShapeSize.height = random(max(targetSize * 0.0, 1600), targetSize * 0.5);
    targetShapeSize.depth = random(max(targetSize * 0.0, 1600), targetSize * 0.5);

    shapeTimer = 0; // Reset the shape timer
  }

  // Smoothly transition the shape size to the target size
  shapeSize.width += (targetShapeSize.width - shapeSize.width) * easing;
  shapeSize.height += (targetShapeSize.height - shapeSize.height) * easing;
  shapeSize.depth += (targetShapeSize.depth - shapeSize.depth) * easing;

  // Apply rotations and scaling
  rotateY(frameCount * 0.001);
  rotateX(frameCount * 0.001);

  let scaleValue = map(filteredAmplitude, 0, 1, 0.1, 2);
  scale(scaleValue);

  // Apply Perlin noise-based rotation
  let noiseValue = noise(noiseOffset);
  let rotationAngle = map(noiseValue, 0, 1, -PI, PI);
  rotateZ(rotationAngle);

  // Set the stroke, fill, and material properties
  stroke(255);
  strokeWeight(1);
  noFill();
  ambientMaterial(255);
  specularMaterial(255);

  // Calculate the maximum subdivisions based on the filtered amplitude
  maxSubdivisions = map(filteredAmplitude, minAmplitude, maxAmplitude, minSubdivisions, maxSubdivisions);
  maxSubdivisions = floor(maxSubdivisions); // Round down to the nearest integer

  // Recursively draw the fractal shape
  drawFractalShape(shapeSize, maxSubdivisions);

  shapeTimer++; // Increment the shape timer

  // Change the current shape to the target shape when the timer reaches the duration
  if (shapeTimer >= shapeDuration) {
    targetShapeSize.width = random(max(targetSize * 0.0, 1600), targetSize * 0.5);
    targetShapeSize.height = random(max(targetSize * 0.0, 1600), targetSize * 0.5);
    targetShapeSize.depth = random(max(targetSize * 0.0, 1600), targetSize * 0.5);

    shapeTimer = 0; // Reset the shape timer
  }

  noiseOffset += noiseIncrement; // Increment the Perlin noise offset
}

// Recursive function to draw the fractal shape
function drawFractalShape(size, subdivisions) {
  if (subdivisions <= 0) {
    box(size.width, size.height, size.depth); // Draw a box when there are no more subdivisions
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
      drawFractalShape(subSize, subdivisions - 1); // Recursively draw the subdivided shape
      pop();
    }
  }
}

function mouseClicked() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.play();
  }
}
