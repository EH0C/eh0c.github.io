// Scene, camera, renderer
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

// Helper: create a canvas texture from text
function createTextTexture(text, bgColor = '#3d3d3dff', textColor = '#000000') {
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

// Textures for each face
const materials = [
    new THREE.MeshBasicMaterial({ map: createTextTexture('(ಥ‿ಥ)') }),       // right
    new THREE.MeshBasicMaterial({ map: createTextTexture('(Θ︹Θ)') }),       // left
    new THREE.MeshBasicMaterial({ map: createTextTexture('( ͡° ͜ʖ ͡° )') }), // top
    new THREE.MeshBasicMaterial({ map: createTextTexture('(ᗒᗣᗕ)') }),       // bottom
    new THREE.MeshBasicMaterial({ map: createTextTexture('(⌐■_■)') }),    // front
    new THREE.MeshBasicMaterial({ map: createTextTexture('(●´⌓`●)') })    // back
];

// Cube setup
const geometry = new THREE.BoxGeometry();
const cube = new THREE.Mesh(geometry, materials);
cube.rotation.set(0.4, 0.7, 0);
scene.add(cube);

// Camera position
let targetCameraZ = 2;
camera.position.z = targetCameraZ;

// Touch support
let touchStartY = 0;
let touchDelta = 0;
const isMobile = /Mobi|Android/i.test(navigator.userAgent);

// Desktop scroll zoom
window.addEventListener("wheel", (event) => {
    targetCameraZ += event.deltaY * 0.003;
    targetCameraZ = Math.min(Math.max(targetCameraZ, 2), 5);
});

// Mobile touch zoom
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

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Smooth zoom
    camera.position.z += (targetCameraZ - camera.position.z) * 0.05;

    // Constant rotation
    const ROTATION_SPEED = 0.01; // moderate speed
    cube.rotation.x += ROTATION_SPEED;
    cube.rotation.y += ROTATION_SPEED;

    // Extra rotation on mobile from touch
    if (isMobile && Math.abs(touchDelta) > 0) {
        cube.rotation.y += touchDelta * 0.002;
        cube.rotation.x += touchDelta * 0.001;
        touchDelta *= 0.9; // decay
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
