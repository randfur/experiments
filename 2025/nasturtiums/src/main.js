import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { createEnvironment } from './environment.js';
import { createNasturtiumPatch } from './nasturtium.js';

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x5D92B1); // Darker Sky Blue to reduce bloom
scene.fog = new THREE.Fog(0x5D92B1, 10, 500);

// Camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2, 2, 4); // Moved back and up slightly
camera.lookAt(0, 0.5, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Better color handling for bright scenes
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// ... imports ...

// Post-Processing
const renderScene = new RenderPass(scene, camera);

// Initial values - You can hardcode your preferred values here later!
const initialConfig = {
    "bloom": {
        "threshold": 0.25,
        "strength": 0.603,
        "radius": 0.164,
        "exposure": 0.9728
    },
    "tree": {
        "x": 0.16,
        "z": -3.52,
        "density": 607,
        "height": 5.376,
        "foliageY": 5.252,
        "radiusXZ": 2.107,
        "radiusY": 0.8428,
        "rotation": 4.04637133782365
    },
    "sky": {
        "brightness": 1.016
    },
    "cloud": {
        "x": -5.8,
        "y": -6.5,
        "z": -18
    },
    "sun": {
        "x": 0.32,
        "y": 12.88,
        "z": -4.08
    },
    "camera": {
        "autoRotate": true,
        "rotateSpeed": 3.6218,
        "position": {
            "x": -1.2879957571733351,
            "y": 3.0096215837606035,
            "z": 4.5201353686458186
        },
        "target": {
            "x": 0,
            "y": 1.25,
            "z": 0
        }
    }
};

const bloomParams = initialConfig.bloom;
renderer.toneMappingExposure = bloomParams.exposure;

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = bloomParams.threshold;
bloomPass.strength = bloomParams.strength;
bloomPass.radius = bloomParams.radius;

const outputPass = new OutputPass();

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);
composer.addPass(outputPass);

// GUI Setup
const gui = new GUI();
const bloomFolder = gui.addFolder('Bloom Settings');

bloomFolder.add(bloomParams, 'threshold', 0.0, 1.0).onChange((value) => {
    bloomPass.threshold = Number(value);
});

bloomFolder.add(bloomParams, 'strength', 0.0, 3.0).onChange((value) => {
    bloomPass.strength = Number(value);
});

bloomFolder.add(bloomParams, 'radius', 0.0, 1.0).onChange((value) => {
    bloomPass.radius = Number(value);
});

const toneMappingFolder = gui.addFolder('Tone Mapping');
toneMappingFolder.add(bloomParams, 'exposure', 0.1, 2.0).onChange((value) => {
    renderer.toneMappingExposure = Number(value);
});


// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0.5, 0);
controls.autoRotate = false;
controls.autoRotateSpeed = 2.0;

// Lighting
// Hemisphere light simulates sky light (blue from above, earthy from below)
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 4.0); // Increased intensity for bloom
sunLight.position.set(5, 10, 5);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 50;
sunLight.shadow.bias = -0.0005;
// Increase shadow area
const d = 10;
sunLight.shadow.camera.left = -d;
sunLight.shadow.camera.right = d;
sunLight.shadow.camera.top = d;
sunLight.shadow.camera.bottom = -d;
scene.add(sunLight);

// Content
const environment = createEnvironment(scene);
createNasturtiumPatch(scene, new THREE.Vector3(0, 0, 0));
createNasturtiumPatch(scene, new THREE.Vector3(-5, 0, -1)); // Left patch
createNasturtiumPatch(scene, new THREE.Vector3(5, 0, -1));  // Right patch

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
const clock = new THREE.Clock();

// GUI Setup (Continued)
const treeFolder = gui.addFolder('Tree Settings');
const treeParams = initialConfig.tree;

// Apply initial tree settings
if (environment.treeGroup) {
    environment.treeGroup.position.x = treeParams.x;
    environment.treeGroup.position.z = treeParams.z;
    environment.treeGroup.rotation.y = treeParams.rotation;

    // Apply height to trunk
    const trunk = environment.treeGroup.children[0];
    trunk.scale.y = treeParams.height / 4;
    trunk.position.y = treeParams.height / 2;

    // Apply foliage settings
    const leaves = environment.treeGroup.children.slice(1);
    const foliageCenter = new THREE.Vector3(0, treeParams.foliageY, 0);

    leaves.forEach((leaf, i) => {
        leaf.visible = i < treeParams.density;
        if (leaf.userData.relativePos) {
            leaf.position.x = leaf.userData.relativePos.x * treeParams.radiusXZ + foliageCenter.x;
            leaf.position.y = leaf.userData.relativePos.y * treeParams.radiusY + foliageCenter.y;
            leaf.position.z = leaf.userData.relativePos.z * treeParams.radiusXZ + foliageCenter.z;
        }
    });
}

treeFolder.add(treeParams, 'x', -10, 10).onChange((v) => {
    if (environment.treeGroup) environment.treeGroup.position.x = v;
});
treeFolder.add(treeParams, 'z', -10, 10).onChange((v) => {
    if (environment.treeGroup) environment.treeGroup.position.z = v;
});
treeFolder.add(treeParams, 'rotation', 0, Math.PI * 2).name('Canopy Rotation').onChange((v) => {
    if (environment.treeGroup) environment.treeGroup.rotation.y = v;
});
treeFolder.add(treeParams, 'height', 2.0, 10.0).name('Trunk Height').onChange((v) => {
    if (environment.treeGroup) {
        const trunk = environment.treeGroup.children[0];
        trunk.scale.y = v / 4;
        trunk.position.y = v / 2;
    }
});

treeFolder.add(treeParams, 'foliageY', 2.0, 15.0).name('Foliage Height').onChange((v) => {
    if (environment.treeGroup) {
        const leaves = environment.treeGroup.children.slice(1);
        const foliageCenter = new THREE.Vector3(0, v, 0);
        leaves.forEach((leaf) => {
            if (leaf.userData.relativePos) {
                leaf.position.x = leaf.userData.relativePos.x * treeParams.radiusXZ + foliageCenter.x;
                leaf.position.y = leaf.userData.relativePos.y * treeParams.radiusY + foliageCenter.y;
                leaf.position.z = leaf.userData.relativePos.z * treeParams.radiusXZ + foliageCenter.z;
            }
        });
    }
});

treeFolder.add(treeParams, 'density', 0, 1000).step(1).onChange((v) => {
    if (environment.treeGroup) {
        const leaves = environment.treeGroup.children.slice(1);
        leaves.forEach((leaf, i) => {
            leaf.visible = i < v;
        });
    }
});

function updateFoliageShape() {
    if (environment.treeGroup) {
        const leaves = environment.treeGroup.children.slice(1);
        const foliageCenter = new THREE.Vector3(0, treeParams.foliageY, 0);
        leaves.forEach((leaf) => {
            if (leaf.userData.relativePos) {
                leaf.position.x = leaf.userData.relativePos.x * treeParams.radiusXZ + foliageCenter.x;
                leaf.position.y = leaf.userData.relativePos.y * treeParams.radiusY + foliageCenter.y;
                leaf.position.z = leaf.userData.relativePos.z * treeParams.radiusXZ + foliageCenter.z;
            }
        });
    }
}

treeFolder.add(treeParams, 'radiusXZ', 0.1, 5.0).name('Foliage Width').onChange(updateFoliageShape);
treeFolder.add(treeParams, 'radiusY', 0.1, 5.0).name('Foliage Tallness').onChange(updateFoliageShape);

const sunFolder = gui.addFolder('Sun Settings');
const sunParams = initialConfig.sun;

function updateSun() {
    sunLight.position.set(sunParams.x, sunParams.y, sunParams.z);
}
updateSun();

sunFolder.add(sunParams, 'x', -20, 20).onChange(updateSun);
sunFolder.add(sunParams, 'y', 0, 20).onChange(updateSun);
sunFolder.add(sunParams, 'z', -20, 20).onChange(updateSun);

const skyFolder = gui.addFolder('Sky Settings');
const skyParams = initialConfig.sky;
const baseSkyColor = new THREE.Color(0x5D92B1);

function updateSky() {
    const brightness = skyParams.brightness;
    const newColor = baseSkyColor.clone().multiplyScalar(brightness);
    scene.background = newColor;
    scene.fog.color = newColor;
}
updateSky();

skyFolder.add(skyParams, 'brightness', 0.0, 2.0).onChange(updateSky);

const cloudFolder = gui.addFolder('Cloud Settings');
const cloudParams = initialConfig.cloud;

if (environment.cloudGroup) {
    environment.cloudGroup.position.set(cloudParams.x, cloudParams.y, cloudParams.z);
}

cloudFolder.add(cloudParams, 'x', -100, 100).onChange((v) => {
    if (environment.cloudGroup) environment.cloudGroup.position.x = v;
});
cloudFolder.add(cloudParams, 'y', -50, 50).onChange((v) => {
    if (environment.cloudGroup) environment.cloudGroup.position.y = v;
});
cloudFolder.add(cloudParams, 'z', -100, 100).onChange((v) => {
    if (environment.cloudGroup) environment.cloudGroup.position.z = v;
});

const cameraFolder = gui.addFolder('Camera Settings');
const cameraParams = initialConfig.camera;

// Apply initial camera settings
if (cameraParams.position) {
    camera.position.copy(cameraParams.position);
}
if (cameraParams.target) {
    controls.target.copy(cameraParams.target);
}
controls.autoRotate = cameraParams.autoRotate;
controls.autoRotateSpeed = cameraParams.rotateSpeed;
controls.update();

cameraFolder.add(controls.target, 'x', -10, 10).name('Look At X').onChange(() => controls.update());
cameraFolder.add(controls.target, 'y', 0, 10).name('Look At Y').onChange(() => controls.update());
cameraFolder.add(controls.target, 'z', -10, 10).name('Look At Z').onChange(() => controls.update());

cameraFolder.add(controls, 'autoRotate').name('Auto Rotate');
cameraFolder.add(controls, 'autoRotateSpeed', 0.1, 20.0).name('Orbit Speed');

const configParams = {
    copySettings: () => {
        const settings = {
            bloom: bloomParams,
            tree: treeParams,
            sky: skyParams,
            cloud: cloudParams,
            sun: sunParams,
            camera: {
                autoRotate: controls.autoRotate,
                rotateSpeed: controls.autoRotateSpeed,
                position: camera.position,
                target: controls.target
            }
        };
        const json = JSON.stringify(settings, null, 4);
        navigator.clipboard.writeText(json).then(() => {
            alert('Settings copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy settings:', err);
            alert('Failed to copy settings. Check console.');
        });
    }
};

gui.add(configParams, 'copySettings').name('Copy Configuration');

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();
    controls.update();

    // Simple wind effect placeholder (will be moved to specific components later)
    scene.traverse((object) => {
        if (object.userData.windAffected) {
            object.rotation.z += Math.sin(time * 2 + object.position.x) * 0.002;
        }
    });

    composer.render();
}

animate();
