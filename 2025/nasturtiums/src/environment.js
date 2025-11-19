import * as THREE from 'three';

function createGround(scene) {
    // Base dirt ground
    const baseGeometry = new THREE.PlaneGeometry(100, 100);
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x3d2e1e,
        roughness: 1.0,
        metalness: 0.0
    });
    const ground = new THREE.Mesh(baseGeometry, baseMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 3D Patches (Low poly flattened cylinders)
    const patchCount = 500;
    const patchGeometry = new THREE.CylinderGeometry(1, 1, 0.05, 6); // Hexagonal patches
    const patchMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d4c1e, // Dark green grass
        roughness: 1.0,
        flatShading: true
    });

    const patches = new THREE.InstancedMesh(patchGeometry, patchMaterial, patchCount);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < patchCount; i++) {
        // Uniform Cartesian distribution
        const x = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 100;

        dummy.position.set(
            x,
            0.03, // Slightly above ground to avoid z-fighting
            z
        );

        dummy.rotation.y = Math.random() * Math.PI * 2;

        // Randomize scale for variety
        const scale = 1 + Math.random() * 3;
        dummy.scale.set(scale, 1, scale);

        dummy.updateMatrix();
        patches.setMatrixAt(i, dummy.matrix);
    }

    patches.receiveShadow = true;
    scene.add(patches);
}

function createGrass(scene) {
    const grassCount = 2000;
    const geometry = new THREE.ConeGeometry(0.05, 0.3, 3);
    geometry.translate(0, 0.15, 0); // Pivot at base
    const material = new THREE.MeshStandardMaterial({
        color: 0x3d5c2e,
        roughness: 1.0
    });

    const instancedGrass = new THREE.InstancedMesh(geometry, material, grassCount);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < grassCount; i++) {
        // Scatter in a radius, avoiding the very center where the nasturtiums are
        const angle = Math.random() * Math.PI * 2;
        const radius = 1 + Math.random() * 15;

        dummy.position.set(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
        );

        dummy.rotation.y = Math.random() * Math.PI;
        // Removed tilt to fix skewing issue

        const scale = 0.5 + Math.random() * 1.0;
        dummy.scale.set(scale, scale, scale);

        dummy.updateMatrix();
        instancedGrass.setMatrixAt(i, dummy.matrix);
    }

    instancedGrass.receiveShadow = true;
    // Grass usually doesn't cast distinct shadows in games for performance, 
    // but we can enable it if needed.
    // instancedGrass.castShadow = true; 

    scene.add(instancedGrass);
}

function createFence(scene) {
    const material = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.4,
        metalness: 0.6
    });

    const barHeight = 2.5;
    const barGeometry = new THREE.CylinderGeometry(0.03, 0.03, barHeight);
    const spearGeometry = new THREE.ConeGeometry(0.08, 0.25, 4); // Pyramidal spear head

    // Horizontal rails
    const railGeometry = new THREE.BoxGeometry(40, 0.08, 0.05);

    const fenceGroup = new THREE.Group();

    // Place rails
    const topRail = new THREE.Mesh(railGeometry, material);
    topRail.position.set(0, 2.0, -2);
    topRail.castShadow = true;
    topRail.receiveShadow = true;
    fenceGroup.add(topRail);

    const bottomRail = new THREE.Mesh(railGeometry, material);
    bottomRail.position.set(0, 0.5, -2);
    bottomRail.castShadow = true;
    bottomRail.receiveShadow = true;
    fenceGroup.add(bottomRail);

    // Vertical bars with spear heads
    for (let x = -19.8; x <= 19.8; x += 0.4) {
        const bar = new THREE.Mesh(barGeometry, material);
        bar.position.set(x, barHeight / 2, -2);
        bar.castShadow = true;
        bar.receiveShadow = true;
        fenceGroup.add(bar);

        const spear = new THREE.Mesh(spearGeometry, material);
        spear.position.set(x, barHeight + 0.125, -2);
        spear.castShadow = true;
        fenceGroup.add(spear);
    }

    scene.add(fenceGroup);
}

function createClouds(scene) {
    const cloudCount = 15;
    const cloudGroup = new THREE.Group();

    const cloudMaterial = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        emissive: 0xaaaaaa, // Slight glow to stay bright
        emissiveIntensity: 0.2
    });

    for (let i = 0; i < cloudCount; i++) {
        const cloud = new THREE.Group();
        const puffs = 3 + Math.floor(Math.random() * 5);

        for (let j = 0; j < puffs; j++) {
            const puffGeometry = new THREE.DodecahedronGeometry(1 + Math.random() * 1.5, 0);
            const puff = new THREE.Mesh(puffGeometry, cloudMaterial);

            puff.position.set(
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 1,
                (Math.random() - 0.5) * 6
            );

            // Random rotation for variety
            puff.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

            cloud.add(puff);
        }

        // Position clouds high up and scattered, initially far back
        cloud.position.set(
            (Math.random() - 0.5) * 150, // Wider spread
            10 + Math.random() * 10,
            -50 - Math.random() * 50 // Start far back (-50 to -100)
        );

        cloudGroup.add(cloud);
    }

    scene.add(cloudGroup);
    return cloudGroup;
}

function createTree(scene) {
    const treeGroup = new THREE.Group();

    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, 4, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x5C4033 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    // Foliage - Many small leaves for dappled light
    const foliageCount = 1000;
    const foliageMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d4c1e,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
    });

    const leafGeometry = new THREE.DodecahedronGeometry(0.2, 0); // Small geometric leaves

    for (let i = 0; i < foliageCount; i++) {
        const leaf = new THREE.Mesh(leafGeometry, foliageMaterial);

        // Random position in a sphere-like volume
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = Math.pow(Math.random(), 1 / 3) * 2.5; // Cube root for uniform distribution

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        // Store relative position for scaling
        leaf.userData.relativePos = new THREE.Vector3(x, y, z);

        leaf.position.set(x, y + 4.5, z); // Centered at top of trunk

        // Random rotation
        leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

        leaf.castShadow = true;
        leaf.receiveShadow = true;
        treeGroup.add(leaf);
    }

    scene.add(treeGroup);
    return treeGroup;
}

export function createEnvironment(scene) {
    createGround(scene);
    createGrass(scene);
    createFence(scene);
    const cloudGroup = createClouds(scene);
    const treeGroup = createTree(scene);

    return { treeGroup, cloudGroup };
}
