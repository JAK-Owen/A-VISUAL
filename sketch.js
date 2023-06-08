// Declare variables and objects
let song, analyzer, fft; // Variables to hold the song, audio analyzer, and FFT objects
let shapeSize = { width: 400, height: 400, depth: 400 }; // Initial size of the shape (default: simple cube)
let targetShapeSize = { width: 400, height: 400, depth: 400 }; // Target size of the shape (default: simple cube)
let easing = 0.02; // Easing coefficient for smooth transitions
let filteredAmplitude = 0.0; // Filtered amplitude value
let filterCoefficient = 0.02; // Coefficient for filtering the amplitude

let shapeTimer = 0; // Timer to control shape changes
let shapeDuration = 300; // Duration for shape changes

let noiseOffset = 0.0; // Offset for Perlin noise
let noiseIncrement = 0.0001; // Increment value for Perlin noise

let minAmplitude = 0.01; // Minimum amplitude threshold
let maxAmplitude = 1.0; // Maximum amplitude threshold
let minSubdivisions = 0; // Minimum number of subdivisions for the fractal shape
let maxSubdivisions = 3; // Maximum number of subdivisions for the fractal shape
let subdivisionFactor = 1.0; // Factor to determine the size of subdivisions

let minThickness = 0.5; // Minimum thickness for lines
let maxThickness = 5; // Maximum thickness for lines

let currentSubdivisions = 0; // Current number of subdivisions

function preload() {
  song = loadSound('N217.mp3'); // Load the sound file
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL); // Create a WebGL canvas with full window size
  song.loop(); // Loop the song
  analyzer = new p5.Amplitude(); // Create an amplitude analyzer object
  analyzer.setInput(song); // Set the input for the analyzer
  fft = new p5.FFT(); // Create the FFT object
  fft.setInput(song); // Set the input for the FFT
}

function draw() {
  background(0); // Clear the background

  let amplitude = analyzer.getLevel(); // Get the current audio level
  filteredAmplitude += (amplitude - filteredAmplitude) * filterCoefficient; // Smoothly filter the amplitude

  let spectrum = fft.analyze(); // Get the frequency spectrum data
  let lowFreqRange = fft.getEnergy("bass", "mid"); // Get the energy in the low frequency range (bass to mid)
  let highFreqRange = fft.getEnergy("mid", "treble"); // Get the energy in the high frequency range (mid to treble)

  let targetSize = map(filteredAmplitude, 0, 1, 100, 800); // Map the filtered amplitude to a target size
  targetSize = max(targetSize, 400); // Ensure the target size is at least the initial size

  // Change the target shape size randomly after a certain duration
  if (random() < 0.001) {
    targetShapeSize.width = random(max(targetSize * 0.5, 400), targetSize * 0.8);
    targetShapeSize.height = random(max(targetSize * 0.5, 400), targetSize * 0.8);
    targetShapeSize.depth = random(max(targetSize * 0.5, 400), targetSize * 0.8);

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
  noFill();
  ambientMaterial(255);
  specularMaterial(255);

  // Adjust the thickness based on frequency ranges
  let thickness = map(highFreqRange, 0, 255, minThickness, maxThickness);
  strokeWeight(thickness);

  updateSubdivisions(lowFreqRange); // Update the number of subdivisions based on low frequency range

  drawFractalShape(shapeSize, currentSubdivisions); // Draw the fractal shape with the current number of subdivisions

  shapeTimer++;

  if (shapeTimer >= shapeDuration) {
    targetShapeSize.width = random(max(targetSize * 0.5, 400), targetSize * 0.8);
    targetShapeSize.height = random(max(targetSize * 0.5, 400), targetSize * 0.8);
    targetShapeSize.depth = random(max(targetSize * 0.5, 400), targetSize * 0.8);

    shapeTimer = 0; // Reset the shape timer
  }

  noiseOffset += noiseIncrement; // Increment the Perlin noise offset
}

function updateSubdivisions(lowFreqRange) {
  // Calculate the target number of subdivisions based on the low frequency range
  let targetSubdivisions = map(lowFreqRange, 0, 255, minSubdivisions, maxSubdivisions);
  
  // Smoothly transition the current subdivisions to the target subdivisions
  currentSubdivisions += (targetSubdivisions - currentSubdivisions) * easing;
  currentSubdivisions = constrain(currentSubdivisions, minSubdivisions, maxSubdivisions);
}

function drawFractalShape(size, subdivisions) {
  if (subdivisions <= 0) {
    box(size.width, size.height, size.depth); // Draw a box when there are no more subdivisions
  } else {
    let amplitudeFactor = map(filteredAmplitude, minAmplitude, maxAmplitude, 0.5, 1.5); // Map the amplitude to a factor between 0.5 and 1.5

    // Adjust the sensitivity at lower amplitudes
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
      drawFractalShape(subSize, subdivisions - 1); // Recursively call with reduced subdivisions
      pop();
    }

    // Adjust the subdivision factor based on the amplitude
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
