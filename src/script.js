import * as THREE from 'three'
import GUI from 'lil-gui'
import gsap from 'gsap'
import { clipping } from 'three/src/nodes/accessors/ClippingNode.js'


/**
 * Debug
 */
const gui = new GUI()

const parameters = {
    materialColor: '#ffeded'
}

gui
    .addColor(parameters, 'materialColor')
    .onChange(() => {
        material.color.set(parameters.materialColor)
    })

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */

const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load('./textures/gradients/3.jpg')
gradientTexture.minFilter = THREE.NearestFilter;
gradientTexture.magFilter = THREE.NearestFilter;
gradientTexture.generateMipmaps = false;

/**
 * Objects
 */

const material = new THREE.MeshToonMaterial({ 
    color: parameters.materialColor,
    gradientMap: gradientTexture
})

const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, .4, 14, 40,),
    material
);

const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material
);

const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(.8, .32, 100, 60),
    material
);

const objectsDistance = 4;

mesh1.position.y = 0
mesh2.position.y = - objectsDistance * 1
mesh3.position.y = - objectsDistance * 2

mesh1.position.x = 2
mesh2.position.x = - 2
mesh3.position.x = 2


scene.add(mesh1, mesh2, mesh3)

const sectionMeshes = [mesh1, mesh2, mesh3]

/**
 * Particles
 */

const particlesGeometry = new THREE.BufferGeometry();
const count = 200;

const positions = new Float32Array(count * 3) // Multiply by 3 because each position is composed of 3 values (x, y, z)

for(let i = 0; i < count * 3; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
	positions[i * 3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * sectionMeshes.length
	positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

const particlesMaterial = new THREE.PointsMaterial({
    color: parameters.materialColor,
    sizeAttenuation: true, // enable perspective
    size: .03
})

const particles = new THREE.Points(particlesGeometry, particlesMaterial);

scene.add(particles)


/**
 * Lights
 */

const directionalLight = new THREE.DirectionalLight('#ffffff', 3);

directionalLight.position.set(1, 1, 0)

scene.add(directionalLight)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */

const cameraGroup = new THREE.Group();
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Scroll
 */

let scrollY = window.scrollY;
let currentSection = 0;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY

    const newSection = Math.round(window.scrollY / sizes.height);
    if(newSection !== currentSection) {
        currentSection = newSection;
        gsap.to(sectionMeshes[currentSection].rotation, {
            x: '+=6',
            y: '+=3',
            z: '+=1.5',
            ease: 'power2.inOut',
            duration: 2
        })
    }
})


/**
 * Cursor
 */

const cursor = {
    x: 0,
    y: 0
}

window.addEventListener('mousemove', (e) => {
    cursor.x = e.clientX / sizes.width - .5;
    cursor.y = e.clientY / sizes.height - .5;
})


/**
 * Animate
 */
const clock = new THREE.Clock()

let previousTime = 0;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    
    // Animate camera
    camera.position.y = - scrollY / sizes.height * objectsDistance * 1.1

    const parallaxX = cursor.x * .5;
    const parallaxY = -cursor.y * .5;

    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 3 * deltaTime // (distance from current pos to the destination) * speed
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 3 * deltaTime

    // Animate meshes
    for(const mesh of sectionMeshes) {
        mesh.rotation.x += deltaTime * .2
        mesh.rotation.y += deltaTime * .22
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()