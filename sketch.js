// Declare variables and objects
let song, analyzer; // Audio-related objects
let shapeSize = { width: 1600, height: 1600, depth: 1600 }; // Current shape size
let targetShapeSize = { width: 1600, height: 1600, depth: 1600 }; // Target shape size
let easing = 0.01; // Easing value for smooth transitions
let filteredAmplitude = 0.0; // Filtered audio amplitude
let filterCoefficient = 0.02; // Coefficient for the low-pass filter

let currentShapeIndex = 0; // Current shape index
let targetShapeIndex = 0; // Target shape index
let shapes = ["box", "sphere", "cylinder", "cone", "ellipsoid", "torus"]; // Available shapes

let shapeTimer = 0; // Timer for shape transitions
let shapeDuration = 300; // Duration for each shape

let interpolationFactor = 0.0; // Factor for shape interpolation

// Preload function to load the audio file
function preload() {
  song = loadSound('N217.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL); // Create a 3D canvas
  song.loop(); // Start playing the audio in a loop
  analyzer = new p5.Amplitude(); // Create an amplitude analyzer object
  analyzer.setInput(song); // Connect the audio input to the analyzer
}

function draw() {
  background(0); // Set the background color to black (RGB 0)

  let amplitude = analyzer.getLevel(); // Get the current audio amplitude
  filteredAmplitude += (amplitude - filteredAmplitude) * filterCoefficient; // Smooth the amplitude using a low-pass filter

  // Map the filtered amplitude to a target shape size
  let targetSize = map(filteredAmplitude, 0, 1, 100, 800);
  targetSize = max(targetSize, 1600);

  // Randomly change the target shape and reset the shape timer
  if (random() < 0.001) {
    targetShapeSize.width = random(max(targetSize * 0.0, 1600), targetSize * 0.5);
    targetShapeSize.height = random(max(targetSize * 0.0, 1600), targetSize * 0.5);
    targetShapeSize.depth = random(max(targetSize * 0.0, 1600), targetSize * 0.5);

    targetShapeIndex = floor(random(shapes.length));

    shapeTimer = 0; // Reset the shape timer
  }

  // Smoothly adjust the shape size towards the target size using easing
  shapeSize.width += (targetShapeSize.width - shapeSize.width) * easing;
  shapeSize.height += (targetShapeSize.height - shapeSize.height) * easing;
  shapeSize.depth += (targetShapeSize.depth - shapeSize.depth) * easing;

  // Interpolate the shape index and size based on the current and target values
  let morphedShapeIndex = lerp(currentShapeIndex, targetShapeIndex, interpolationFactor);
  let morphedShapeSize = {
    width: lerp(shapeSize.width, targetShapeSize.width, interpolationFactor),
    height: lerp(shapeSize.height, targetShapeSize.height, interpolationFactor),
    depth: lerp(shapeSize.depth, targetShapeSize.depth, interpolationFactor)
  };

  rotateY(frameCount * 0.001); // Rotate the 3D scene around the Y-axis
  rotateX(frameCount * 0.001); // Rotate the 3D scene around the X-axis

  let scaleValue = map(filteredAmplitude, 0, 1, 0.1, 2); // Map the filtered amplitude to a scale value
  scale(scaleValue); // Apply the scale to the 3D scene

  stroke(255); // Set the stroke color to white
  strokeWeight(1); // Set the stroke weight to 1
  noFill(); // Disable filling shapes
  ambientMaterial(255); // Set the ambient material to white
  specularMaterial(255); // Set the specular material to white

  drawShape(morphedShapeIndex, morphedShapeSize); // Draw the current shape

  shapeTimer++; // Increment the shape timer

  // If the shape timer exceeds the duration, update the current shape and reset the interpolation factor
  if (shapeTimer >= shapeDuration) {
    currentShapeIndex = targetShapeIndex;
    interpolationFactor = 0.0; // Reset the interpolation factor
  }

  // Gradually increase the interpolation factor during shape transitions
  if (currentShapeIndex !== targetShapeIndex && interpolationFactor < 0.0) {
    interpolationFactor += 0.001;
  }
}

// Function to draw a shape based on its index and size
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

// Toggle audio playback when the mouse is pressed
function mousePressed() {
  if (song.isPlaying()) {
    song.stop();
  } else {
    song.play();
  }
}

// Resize the canvas when the window size changes
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
