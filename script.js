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

// Helper: Create canvas texture with text and color
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

// Default cube texts and colors
const defaultTexts = ['(ಥ‿ಥ)', '(Θ︹Θ)', '( ͡° ͜ʖ ͡° )', '(ᗒᗣᗕ)', '(⌐■_■)', '(●´⌓`●)'];
const defaultColor = '#292929ff';

// Create initial cube materials
let materials = defaultTexts.map(txt => new THREE.MeshBasicMaterial({ map: createTextTexture(txt, defaultColor) }));

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
window.addEventListener("touchstart", (event) => { touchStartY = event.touches[0].clientY; });
window.addEventListener("touchmove", (event) => {
    const touchY = event.touches[0].clientY;
    touchDelta = touchStartY - touchY;
    targetCameraZ += touchDelta * 0.01;
    targetCameraZ = Math.min(Math.max(targetCameraZ, 2), 5);
    touchStartY = touchY;
});

// Floating setup
let velocity = new THREE.Vector3((Math.random()-0.5)*0.005, (Math.random()-0.5)*0.005, 0);

// Animation state
let animType = null;      // 'pulse', 'spin', 'jump', 'shake'
let animTimer = 0;
let flashTexture = null;
let flashColor = defaultColor;

// Map skills to messages, animation type, and color
const skillMap = {
    "HTML / CSS": { text: "(HTML/CSS!)", anim: "pulse", color: "#ff4c4c" },
    "JavaScript": { text: "(JS!)", anim: "pulse", color: "#ffd500" },
    "Python": { text: "(Python!)", anim: "pulse", color: "#4caf50" },
    "SQL": { text: "(SQL!)", anim: "pulse", color: "#2196f3" }
};

// Click listeners
document.querySelectorAll('.skill').forEach(skill => {
    skill.addEventListener('click', () => {
        const skillText = skill.textContent.trim();
        if (skillMap[skillText]) {
            flashTexture = createTextTexture(skillMap[skillText].text, skillMap[skillText].color);
            flashColor = skillMap[skillText].color;
            animType = skillMap[skillText].anim;
            animTimer = 40; // duration of animation (~40 frames)
        }
    });
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Smooth camera zoom
    camera.position.z += (targetCameraZ - camera.position.z) * 0.05;

    // Floating movement
    cube.position.add(velocity);

    // Bounce off screen bounds
    const bounds = 1.5;
    if (cube.position.x > bounds || cube.position.x < -bounds) velocity.x *= -1;
    if (cube.position.y > bounds || cube.position.y < -bounds) velocity.y *= -1;

    // Slight random acceleration
    velocity.x += (Math.random() - 0.5) * 0.0005;
    velocity.y += (Math.random() - 0.5) * 0.0005;
    velocity.x = THREE.MathUtils.clamp(velocity.x, -0.01, 0.01);
    velocity.y = THREE.MathUtils.clamp(velocity.y, -0.01, 0.01);

    // Base rotation
    const ROTATION_SPEED = 0.01;
    cube.rotation.x += ROTATION_SPEED;
    cube.rotation.y += ROTATION_SPEED;

    // Extra rotation on mobile
    if (isMobile && Math.abs(touchDelta) > 0) {
        cube.rotation.y += touchDelta * 0.002;
        cube.rotation.x += touchDelta * 0.001;
        touchDelta *= 0.9;
    }

    // Handle skill animation
    if (animTimer > 0 && flashTexture) {
        // Change all faces
        for (let i=0;i<6;i++) cube.material[i].map = flashTexture;

        // Apply animation types
        switch(animType) {
            case "pulse":
                const scale = 1 + 0.2 * Math.sin((animTimer/40)*Math.PI*2);
                cube.scale.set(scale, scale, scale);
                break;
            case "spin":
                cube.rotation.x += 0.1;
                cube.rotation.y += 0.1;
                break;
            case "jump":
                cube.position.y += Math.sin((animTimer/40)*Math.PI*2)*0.05;
                break;
            case "shake":
                cube.position.x += Math.sin((animTimer/40)*Math.PI*4)*0.05;
                break;
        }

        animTimer--;
    } else {
        // Restore default cube
        for (let i=0;i<6;i++) cube.material[i].map = createTextTexture(defaultTexts[i], defaultColor);
        cube.scale.set(1,1,1);
        animType = null;
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
