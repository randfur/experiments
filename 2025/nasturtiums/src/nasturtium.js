import * as THREE from 'three';

export function createNasturtiumPatch(scene, position = new THREE.Vector3(0, 0, 0)) {
    const patchGroup = new THREE.Group();
    patchGroup.position.copy(position);

    // Create multiple plants
    for (let i = 0; i < 15; i++) {
        const x = (Math.random() - 0.5) * 3;
        const z = (Math.random() - 0.5) * 2;
        createPlant(patchGroup, new THREE.Vector3(x, 0, z));
    }

    scene.add(patchGroup);
    return patchGroup;
}

function createPlant(parent, position) {
    const stemCount = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < stemCount; i++) {
        createStem(parent, position);
    }
}

function createStem(parent, origin) {
    // Generate a random curve for the stem
    const points = [];
    points.push(origin.clone());

    let currentPos = origin.clone();
    const height = 0.5 + Math.random() * 1.0;
    const segments = 5;

    for (let i = 0; i < segments; i++) {
        currentPos.y += height / segments;
        currentPos.x += (Math.random() - 0.5) * 0.5;
        currentPos.z += (Math.random() - 0.5) * 0.5;
        points.push(currentPos.clone());
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 20, 0.015, 6, false);
    const material = new THREE.MeshStandardMaterial({ color: 0x6b8c42 });

    const stem = new THREE.Mesh(geometry, material);
    stem.castShadow = true;
    parent.add(stem);

    // Add a leaf or flower at the end
    if (Math.random() > 0.2) {
        createLeaf(parent, currentPos);
    } else {
        createFlower(parent, currentPos);
    }
}

function createLeaf(parent, position) {
    // Nasturtium leaves are peltate (stem attached in middle) and round
    const geometry = new THREE.CircleGeometry(0.15 + Math.random() * 0.1, 12);
    const material = new THREE.MeshStandardMaterial({
        color: 0x5c8a3b,
        side: THREE.DoubleSide,
        roughness: 0.6
    });

    const leaf = new THREE.Mesh(geometry, material);
    leaf.position.copy(position);

    // Random rotation to look natural
    leaf.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
    leaf.rotation.z = Math.random() * Math.PI * 2;
    leaf.rotation.y = (Math.random() - 0.5) * 0.5;

    leaf.castShadow = true;
    leaf.receiveShadow = true;
    leaf.userData.windAffected = true;

    parent.add(leaf);
}

function createFlower(parent, position) {
    const flowerGroup = new THREE.Group();
    flowerGroup.position.copy(position);

    // Orient the whole flower
    flowerGroup.rotation.x = Math.PI / 4 + (Math.random() - 0.5);
    flowerGroup.rotation.z = Math.random() * Math.PI;

    // 1. The Spur (long thin cone at the back)
    const spurGeometry = new THREE.ConeGeometry(0.02, 0.15, 8);
    const material = new THREE.MeshStandardMaterial({
        color: 0xff9900,
        side: THREE.DoubleSide,
        emissive: 0xff4400,
        emissiveIntensity: 0.2,
        roughness: 0.5
    });
    const spur = new THREE.Mesh(spurGeometry, material);
    spur.rotation.x = -Math.PI / 2; // Point backwards
    spur.position.z = -0.075;
    flowerGroup.add(spur);

    // 2. The Petals (5 petals)
    const petalGeometry = new THREE.CircleGeometry(0.06, 8);
    for (let i = 0; i < 5; i++) {
        const petal = new THREE.Mesh(petalGeometry, material);
        const angle = (i / 5) * Math.PI * 2;

        // Position petal slightly out from center
        petal.position.set(Math.cos(angle) * 0.03, Math.sin(angle) * 0.03, 0);

        // Rotate to face forward but flare out
        petal.rotation.z = angle - Math.PI / 2;
        petal.rotation.x = 0.3; // Flare out

        flowerGroup.add(petal);
    }

    flowerGroup.castShadow = true;
    flowerGroup.userData.windAffected = true;

    parent.add(flowerGroup);
}
