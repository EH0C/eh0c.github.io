// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

// Helper: Create canvas texture with text
function createTextTexture(text, bgColor = '#3d3d3dff', textColor = '#ffffff') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '48px Arial';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    return new THREE.CanvasTexture(canvas);
}

// Default cube texts
const defaultTexts = ['(ಥ‿ಥ)', '(Θ︹Θ)', '( ͡° ͜ʖ ͡° )', '(ᗒᗣᗕ)', '(⌐■_■)', '(●´⌓`●)'];

// Create initial cube materials
let materials = defaultTexts.map(txt => new THREE.MeshBasicMaterial({ map: createTextTexture(txt) }));

// Cube setup
const geometry = new THREE.BoxGeometry();
const cube = new THREE.Mesh(geometry, materials);
cube.rotation.set(0.4, 0.7, 0);
scene.add(cube);

// Camera
let targetCameraZ = 2;
camera.position.z = targetCameraZ;

// Touch support
let touchStartY = 0;
let touchDelta = 0;
const isMobile = /Mobi|Android/i.test(navigator.userAgent);

// Scroll zoom
window.addEventListener("wheel", (event) => {
    targetCameraZ += event.deltaY * 0.003;
    targetCameraZ = Math.min(Math.max(targetCameraZ, 2), 5);
});

window.addEventListener("touchstart", (event) => {
    touchStartY = event.touches[0].clientY;
});

window.addEventListener("touchmove", (event) => {
    const touchY = event.touches[0].clientY;
    touchDelta = touchStartY - touchY;
    targetCameraZ += touchDelta * 0.01;
    targetCameraZ = Math.min(Math.max(targetCameraZ, 2), 5);
    touchStartY = touchY;
});

// Floating setup
let velocity = new THREE.Vector3(
    (Math.random() - 0.5) * 0.005,
    (Math.random() - 0.5) * 0.005,
    0
);

// Spin and flash state
let spinBoost = 0;
let flashTimer = 0;
let flashTexture = null;

// Map skills to messages
const skillMap = {
    "HTML / CSS": "(HTML/CSS!)",
    "JavaScript": "(JS!)",
    "Python": "(Python!)",
    "SQL": "(SQL!)"
};

// Click listeners to change all faces
document.querySelectorAll('.skill').forEach(skill => {
    skill.addEventListener('click', () => {
        const skillText = skill.textContent.trim();
        if (skillMap[skillText]) {
            flashTexture = createTextTexture(skillMap[skillText]);
            flashTimer = 20;  // show for ~20 frames
            spinBoost = 0.05; // temporary rotation boost
        }
    });
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Smooth camera zoom
    camera.position.z += (targetCameraZ - camera.position.z) * 0.05;

    // Constant rotation
    const ROTATION_SPEED = 0.01;
    cube.rotation.x += ROTATION_SPEED + spinBoost;
    cube.rotation.y += ROTATION_SPEED + spinBoost;

    // Extra rotation on mobile
    if (isMobile && Math.abs(touchDelta) > 0) {
        cube.rotation.y += touchDelta * 0.002;
        cube.rotation.x += touchDelta * 0.001;
        touchDelta *= 0.9;
    }

    // Floating movement
    cube.position.add(velocity);

    // Bounce off screen bounds
    const bounds = 1.5;
    if (cube.position.x > bounds || cube.position.x < -bounds) velocity.x *= -1;
    if (cube.position.y > bounds || cube.position.y < -bounds) velocity.y *= -1;

    // Slight random acceleration
    velocity.x += (Math.random() - 0.5) * 0.0005;
    velocity.y += (Math.random() - 0.5) * 0.0005;

    // Clamp velocity
    velocity.x = THREE.MathUtils.clamp(velocity.x, -0.01, 0.01);
    velocity.y = THREE.MathUtils.clamp(velocity.y, -0.01, 0.01);

    // Flash / change all faces
    if (flashTimer > 0 && flashTexture) {
        for (let i = 0; i < cube.material.length; i++) {
            cube.material[i].map = flashTexture;
        }
        flashTimer--;
    } else {
        // Restore default texts
        for (let i = 0; i < cube.material.length; i++) {
            cube.material[i].map = createTextTexture(defaultTexts[i]);
        }
        spinBoost *= 0.95; // decay rotation boost
    }

    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
