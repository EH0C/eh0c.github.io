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
    targetCameraZ += event.deltaY * 0.003;
    targetCameraZ = Math.min(Math.max(targetCameraZ, 2), 5);
});

// Touch control (mobile)
let touchStartY = 0;
let touchDelta = 0;

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

// Detect mobile
const isMobile = /Mobi|Android/i.test(navigator.userAgent);

// Animation
function animate() {
    requestAnimationFrame(animate);

    // Smooth camera zoom using easing
    camera.position.z += (targetCameraZ - camera.position.z) * 0.05;

    // Zoom factor
    let t = (camera.position.z - 2) / (5 - 2);
    t = Math.min(Math.max(t, 0), 1);

    if (t < 0.2) {
        cube.rotation.x = lockedRotation.x;
        cube.rotation.y = lockedRotation.y;
    } else {
        const speed = t * 0.02;

        // Desktop rotation
        cube.rotation.x += speed;
        cube.rotation.y += speed;

        if (isMobile) {
            // Continuous slow rotation on mobile
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.015;

            // Add touch-based extra rotation
            if (Math.abs(touchDelta) > 0) {
                cube.rotation.y += touchDelta * 0.002;
                cube.rotation.x += touchDelta * 0.001;
                touchDelta *= 0.9; // decay
            }
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
