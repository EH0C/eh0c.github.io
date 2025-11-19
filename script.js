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

// Cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshNormalMaterial({ wireframe: false });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Initial camera position
let targetCameraZ = 2;
camera.position.z = targetCameraZ;

// Lock cube rotation for zoomed-in
const lockedRotation = { x: 0, y: 0 };

// Scroll control (desktop)
window.addEventListener("wheel", (event) => {
    targetCameraZ += event.deltaY * 0.003; // smaller increment for smoothness
    targetCameraZ = Math.min(Math.max(targetCameraZ, 2), 5); // clamp
});

// Touch control (mobile)
let touchStartY = 0;
let touchDelta = 0;

window.addEventListener("touchstart", (event) => {
    touchStartY = event.touches[0].clientY;
});

window.addEventListener("touchmove", (event) => {
    const touchY = event.touches[0].clientY;
    touchDelta = touchStartY - touchY; // swipe up = zoom in
    targetCameraZ += touchDelta * 0.01; // adjust sensitivity
    targetCameraZ = Math.min(Math.max(targetCameraZ, 2), 5); // clamp
    touchStartY = touchY;
});

// Animation
function animate() {
    requestAnimationFrame(animate);

    // Smooth camera zoom using easing
    camera.position.z += (targetCameraZ - camera.position.z) * 0.05;

    // Calculate zoom factor (0 = close, 1 = far)
    let t = (camera.position.z - 2) / (5 - 2);
    t = Math.min(Math.max(t, 0), 1); // clamp 0-1

    if (t < 0.2) {
        // Almost zoomed in: lock rotation
        cube.rotation.x = lockedRotation.x;
        cube.rotation.y = lockedRotation.y;
    } else {
        // Zoomed out: rotate cube
        const speed = t * 0.02;

        // Desktop rotation
        cube.rotation.x += speed;
        cube.rotation.y += speed;

        // Mobile extra rotation based on swipe
        if (Math.abs(touchDelta) > 0) {
            cube.rotation.y += touchDelta * 0.002; // horizontal rotation
            cube.rotation.x += touchDelta * 0.001; // vertical rotation
            touchDelta *= 0.9; // decay delta for smooth stop
        }
    }

    renderer.render(scene, camera);
}

animate();

// Handle resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
