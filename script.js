// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // black background

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(80, 30, 80);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 20;
controls.maxDistance = 200;
// Light (Sunlight)
const light = new THREE.PointLight(0xffffff, 2, 500);
light.position.set(0, 0, 0);
scene.add(light);

// Sun
const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFDB813 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planet data: [name, orbitRadius, size, color, initialSpeed]
const planetsData = [
  ['Mercury', 10, 1.2, 0xb1b1b1, 0.02],
  ['Venus', 15, 2.2, 0xeccc9a, 0.015],
  ['Earth', 20, 2.5, 0x2c72d9, 0.01],
  ['Mars', 25, 1.8, 0xd14c32, 0.008],
  ['Jupiter', 35, 4.5, 0xd4b587, 0.005],
  ['Saturn', 45, 4.0, 0xf5deb3, 0.004],
  ['Uranus', 55, 3.2, 0x7fffd4, 0.003],
  ['Neptune', 65, 3.0, 0x1e90ff, 0.002]
];

const planets = [];
const angles = [];
const speeds = [];

for (let i = 0; i < planetsData.length; i++) {
  const [name, orbitRadius, size, color, speed] = planetsData[i];

  const geometry = new THREE.SphereGeometry(size, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: color });
  const planet = new THREE.Mesh(geometry, material);
  if (name === 'Saturn') {
    const ringGeometry = new THREE.RingGeometry(size + 1, size + 3, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xd2b48c,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;  // Lay flat horizontally
    ring.position.set(0, 0, 0);
    planet.add(ring);  // Add ring as child of Saturn
  }
  scene.add(planet);
  
  planets.push({ mesh: planet, orbitRadius, name });
  angles.push(0);
  speeds.push(speed);
}
for (let i = 0; i < planetsData.length; i++) {
  const orbitRadius = planetsData[i][1]; // get orbit radius

  const orbitGeometry = new THREE.RingGeometry(orbitRadius - 0.1, orbitRadius + 0.1, 64);
  const orbitMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.2,
  });
  const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);

  orbit.rotation.x = -Math.PI / 2; // rotate flat on X axis
  scene.add(orbit);
}

// 🌟 Add background stars
function createStars(count) {
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });

  const starVertices = [];
  for (let i = 0; i < count; i++) {
    const x = THREE.MathUtils.randFloatSpread(200);
    const y = THREE.MathUtils.randFloatSpread(200);
    const z = THREE.MathUtils.randFloatSpread(200);
    starVertices.push(x, y, z);
  }

  starGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(starVertices, 3)
  );

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}
createStars(500);

// Tooltip for planet names
const labelDiv = document.createElement('div');
labelDiv.style.position = 'fixed';
labelDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
labelDiv.style.color = 'white';
labelDiv.style.padding = '4px 8px';
labelDiv.style.borderRadius = '4px';
labelDiv.style.pointerEvents = 'none';
labelDiv.style.display = 'none';
labelDiv.style.fontFamily = 'Arial, sans-serif';
document.body.appendChild(labelDiv);

// Raycaster and mouse vector
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  mouseX = event.clientX;
  mouseY = event.clientY;
});

// Animation control
let isPaused = false;
let mouseX = 0;
let mouseY = 0;

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  if (!isPaused) {
    for (let i = 0; i < planets.length; i++) {
      angles[i] += speeds[i];
      planets[i].mesh.position.x = planets[i].orbitRadius * Math.cos(angles[i]);
      planets[i].mesh.position.z = planets[i].orbitRadius * Math.sin(angles[i]);
      planets[i].mesh.rotation.y += 0.01;
    }
  }
  controls.update();

  // Hover detection for tooltips
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

  if (intersects.length > 0) {
    const planet = intersects[0].object;
    const planetData = planets.find(p => p.mesh === planet);
    if (planetData) {
      labelDiv.style.display = 'block';
      labelDiv.textContent = planetData.name;
      labelDiv.style.left = (mouseX + 10) + 'px';
      labelDiv.style.top = (mouseY + 10) + 'px';
    }
  } else {
    labelDiv.style.display = 'none';
  }

  renderer.render(scene, camera);
}
animate();

// UI Controls Panel
const controlsDiv = document.createElement('div');
controlsDiv.style.position = 'fixed';
controlsDiv.style.top = '10px';
controlsDiv.style.left = '10px';
controlsDiv.style.background = '#222';
controlsDiv.style.padding = '15px';
controlsDiv.style.borderRadius = '8px';
controlsDiv.style.color = 'white';
controlsDiv.style.maxHeight = '90vh';
controlsDiv.style.overflowY = 'auto';
controlsDiv.style.width = '200px';
controlsDiv.style.fontFamily = 'Arial, sans-serif';
document.body.appendChild(controlsDiv);

// Sliders for planet speeds
for (let i = 0; i < planets.length; i++) {
  const planet = planets[i];
  const speed = speeds[i];

  const label = document.createElement('label');
  label.textContent = planet.name + ' Speed:';
  label.style.display = 'block';
  label.style.marginTop = '10px';

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '0.1';
  slider.step = '0.001';
  slider.value = speed;
  slider.style.width = '100%';

  slider.addEventListener('input', (event) => {
    speeds[i] = parseFloat(event.target.value);
  });

  label.appendChild(slider);
  controlsDiv.appendChild(label);
}

// Pause/Resume Button
const pauseButton = document.createElement('button');
pauseButton.textContent = 'Pause';
pauseButton.style.marginTop = '15px';
pauseButton.style.padding = '8px 12px';
pauseButton.style.background = '#444';
pauseButton.style.color = 'white';
pauseButton.style.border = 'none';
pauseButton.style.borderRadius = '5px';
pauseButton.style.cursor = 'pointer';
pauseButton.style.width = '100%';

pauseButton.addEventListener('click', () => {
  isPaused = !isPaused;
  pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
});

controlsDiv.appendChild(pauseButton);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
// Dark/Light mode toggle button
const toggleButton = document.createElement('button');
toggleButton.textContent = 'Switch to Dark Mode';
toggleButton.style.marginTop = '15px';
toggleButton.style.padding = '8px 12px';
toggleButton.style.background = '#eee';
toggleButton.style.color = '#000';
toggleButton.style.border = 'none';
toggleButton.style.borderRadius = '5px';
toggleButton.style.cursor = 'pointer';
toggleButton.style.width = '100%';

let isDark = false; // start in light mode

toggleButton.addEventListener('click', () => {
  isDark = !isDark;

  if (isDark) {
    controlsDiv.style.background = '#222';
    controlsDiv.style.color = 'white';
    toggleButton.textContent = 'Switch to Light Mode';
    toggleButton.style.background = '#444';
    toggleButton.style.color = 'white';
  } else {
    controlsDiv.style.background = '#eee';
    controlsDiv.style.color = '#000';
    toggleButton.textContent = 'Switch to Dark Mode';
    toggleButton.style.background = '#ddd';
    toggleButton.style.color = '#000';
  }
});

controlsDiv.appendChild(toggleButton);

