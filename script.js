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

// Scroll control
window.addEventListener("wheel", (event) => {
    targetCameraZ += event.deltaY * 0.003; // smaller increment for smoothness
    targetCameraZ = Math.min(Math.max(targetCameraZ, 2), 5); // clamp
});

// Animation
function animate() {
    requestAnimationFrame(animate);

    // Smooth camera zoom using easing
    camera.position.z += (targetCameraZ - camera.position.z) * 0.05;

    // Calculate how far we are zoomed out (0 = close, 1 = far)
    let t = (camera.position.z - 2) / (5 - 2);
    t = Math.min(Math.max(t, 0), 1); // clamp 0-1

    if (t < 0.2) {
        // Almost zoomed in: lock rotation
        cube.rotation.x = lockedRotation.x;
        cube.rotation.y = lockedRotation.y;
    } else {
        // Zoomed out: rotate cube smoothly
        const speed = t * 0.02; // speed proportional to zoom
        cube.rotation.x += speed;
        cube.rotation.y += speed;
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
